import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { merge, Observable, of, Subject } from 'rxjs';
import {count, map, tap} from 'rxjs/operators';
import { defaultLanguage, languages } from '../shared/model/languages';
import { SpeechError } from '../shared/model/speech-error';
import { SpeechEvent } from '../shared/model/speech-event';
import { SpeechRecognizerService } from '../shared/services/web-apis/speech-recognizer.service';
import { ActionContext } from '../shared/services/actions/action-context';
import { SpeechNotification } from '../shared/model/speech-notification';
import {StudentError} from '../shared/Entities/student-error';
import {StudentErrorType} from '../shared/Entities/student-error-type.enum';

@Component({
  selector: 'wsa-web-speech',
  templateUrl: './web-speech.component.html',
  styleUrls: ['./web-speech.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebSpeechComponent implements OnInit {
  SEPARATORS = ['.', ' ', ',', '!', '?'];
  languages: string[] = languages;
  currentLanguage: string = defaultLanguage;
  totalTranscript = '';
  transcript$?: Observable<string>;
  listening$?: Observable<boolean>;
  isListening = false;
  errorMessage$?: Observable<string>;
  defaultError$ = new Subject<string | undefined>();
  errorTypes: string[] = [];
  activeErrorType = '';
  activeStudent = {id: 1, name: 'John Doe', course: 'Technical English Communication A'};
  exam = {name: 'Mid Term 2020S', maxPoints: 100, reachedPoints: 0};
  tempTranscript = 'init';

  constructor(
    private speechRecognizer: SpeechRecognizerService,
    private actionContext: ActionContext
  ) {
  }

  ngOnInit(): void {
    this.totalTranscript = 'Flamingos usually stand on one leg, with the other being tucked beneath the body. ' +
      'The reason for this behaviour is not fully understood. One theory is that standing on one leg allows the ' +
      'birds to conserve more body heat, given that they spend a significant amount of time wading in cold water. ' +
      'However, the behaviour also takes place in warm water and is also observed in birds that do not typically stand in water. ' +
      'An alternative theory is that standing on one leg reduces the energy expenditure for producing muscular effort to ' +
      'stand and balance on one leg. A study on cadavers showed that the one-legged pose could be held without any ' +
      'muscle activity, while living flamingos demonstrate substantially less body sway in a one-legged posture. ' +
      'As well as standing in the water, flamingos may stamp their webbed feet in the mud to stir up food from the bottom. ' +
      'Flamingos are capable flyers, and flamingos in captivity often require wing clipping to prevent escape. ' +
      'A pair of African flamingos which had not yet had their wings clipped escaped from the Wichita, Kansas zoo in 2005. ' +
      'One was spotted in Texas 14 years later. Young flamingos hatch with grayish-red plumage, but adults range from ' +
      'light pink to bright red due to aqueous bacteria and beta-carotene obtained from their food supply. A well-fed, ' +
      'healthy flamingo is more vibrantly colored, thus a more desirable mate; a white or pale flamingo, however, is usually ' +
      'unhealthy or malnourished. Captive flamingos are a notable exception; they may turn a pale pink if they are not fed ' +
      'carotene at levels comparable to the wild. Flamingoes can open their bills by raising the upper jaw as well as by ' +
      'dropping the lower.';
    const webSpeechReady = this.speechRecognizer.initialize(this.currentLanguage);
    if (webSpeechReady) {
      this.initRecognition();
    } else {
      this.errorMessage$ = of('Your Browser is not supported. Please try Google Chrome.');
    }
    for (const error of Object.keys(StudentErrorType)) {
      this.errorTypes.push(error);
    }
    this.activeErrorType = this.errorTypes[0];
  }

  changeErrorType(type: string): void {
    this.activeErrorType = type;
  }

  wordClicked(event: Event): void {
    const selection = window.getSelection();
    if (selection != null) {
      const range = selection.getRangeAt(0);
      let globalIndexes = [-1, -1];
      // if word is clicked
      if (range.startOffset === range.endOffset) {
        const wordIndexes = this.getWordIndexByChar(range.startContainer.textContent, range.startOffset);
        if (wordIndexes[0] !== -1 && wordIndexes[1] !== -1) {
          globalIndexes = this.getGlobalIndex(range.startContainer, wordIndexes[0], range.endContainer, wordIndexes[1]);
        }
      } else {
        globalIndexes = this.getGlobalIndex(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
      }
      this.saveAnnotation(globalIndexes[0], globalIndexes[1], this.activeErrorType.split(' ').join(''));
      const charPos = selection.focusOffset;
    }
  }

  getTextWithoutHTMLElements(text: string): string {
    return text.replace(/<[^>]+>/g, '');
  }

  getGlobalIndex(startContainer: Node, start: number, endContainer: Node, end: number): number[] {
    const indexesFront = this.getIndexesBefore(startContainer);
    const indexesBack = this.getIndexesBefore(endContainer);
    return [indexesFront + start, indexesBack + end];
  }

  getIndexesBefore(node: Node): number {
    let currentNode = node;
    let indexesFront = 0;
    while (currentNode !== null && (currentNode.previousSibling !== null ||
      (currentNode.parentElement != null && currentNode.parentElement.getAttribute('id') !== 'full-transcript'))) {
      if (currentNode.previousSibling !== null) {
        currentNode = currentNode.previousSibling;
      } else if (currentNode.parentElement !== null) {
        currentNode = currentNode.parentElement;
        continue;
      }
      if (currentNode.textContent !== null) {
        indexesFront += currentNode.textContent.length;
      }
    }
    return indexesFront;
  }

  /**
   * returns start (incl.) and end index (excl.) of selected word
   * @param text of analyzed string
   * @param charIndex of selected char
   */
  getWordIndexByChar(text: string | null, charIndex: number): number[] {
    if (text === null) {
      return [-1, -1];
    }
    let startindex = charIndex;
    let endindex = charIndex;
    while (startindex > 0 && this.SEPARATORS.indexOf(text[startindex - 1]) === -1) {
      startindex--;
    }
    while (endindex <= text.length - 1 && this.SEPARATORS.indexOf(text[endindex]) === -1) {
      endindex++;
    }
    // a SEPARATOR char is clicked which is followed by another SEPARATOR
    if (startindex === endindex) {
      endindex++;
    }
    return [startindex, endindex];
  }

  saveAnnotation(start: number, end: number, annotationType: string): void {
    const newId = StudentError.getNewId(StudentError.getErrorsFromString(this.totalTranscript));
    this.insertIntoTranscript(end, `<error id="${newId}"/>`);
    this.insertIntoTranscript(start, `<error id="${newId}" type="${annotationType}"/>`);
  }

  insertIntoTranscript(index: number, text: string): void {
    let counter = 0;
    let inTag = false;
    let totalIndex = 0;
    for (; index > counter && totalIndex < this.totalTranscript.length; totalIndex++) {
      if (this.totalTranscript[totalIndex] === '<') {
        inTag = true;
      } else if (this.totalTranscript[totalIndex] === '>') {
        inTag = false;
        counter--;
      }
      if (!inTag) {
        counter++;
      }
    }
    this.totalTranscript = [this.totalTranscript.slice(0, totalIndex), text, this.totalTranscript.slice(totalIndex)].join('');
  }

  toogleListening(): void {
    if (this.isListening) {
      this.stop();
    } else {
      this.start();
    }
  }

  start(): void {
    if (this.speechRecognizer.isListening) {
      this.stop();
      return;
    }

    this.defaultError$.next(undefined);
    this.speechRecognizer.start();
    this.isListening = true;
  }

  listening(): boolean {
    return this.isListening;
  }

  stop(): void {
    this.speechRecognizer.stop();
    this.isListening = false;
  }

  selectLanguage(language: string): void {
    if (this.speechRecognizer.isListening) {
      this.stop();
    }
    this.currentLanguage = language;
    this.speechRecognizer.setLanguage(this.currentLanguage);
  }

  private initRecognition(): void {
    this.transcript$ = this.speechRecognizer.onResult().pipe(
      tap((notification) => {
        this.processNotification(notification);
      }),
      map((notification) => notification.content || '')
    );

    this.listening$ = merge(
      this.speechRecognizer.onStart(),
      this.speechRecognizer.onEnd()
    ).pipe(map((notification) => notification.event === SpeechEvent.Start));

    this.errorMessage$ = merge(
      this.speechRecognizer.onError(),
      this.defaultError$
    ).pipe(
      map((data) => {
        if (data === undefined) {
          return '';
        }
        if (typeof data === 'string') {
          return data;
        }
        let message;
        switch (data.error) {
          case SpeechError.NotAllowed:
            message = `Cannot run the demo.
            Your browser is not authorized to access your microphone.
            Verify that your browser has access to your microphone and try again.`;
            break;
          case SpeechError.NoSpeech:
            message = `No speech has been detected. Please try again.`;
            break;
          case SpeechError.AudioCapture:
            message = `Microphone is not available. Please verify the connection of your microphone and try again.`;
            break;
          default:
            message = '';
            break;
        }
        return message;
      })
    );
  }

  private processNotification(notification: SpeechNotification<string>): void {
    if (notification.event === SpeechEvent.FinalContent) {
      const message = notification.content?.trim() || '';
      this.actionContext.processMessage(message, this.currentLanguage);
      // this.actionContext.runAction(message, this.currentLanguage);
      this.totalTranscript = `${this.totalTranscript} ${message}.`;
    }
  }

}
