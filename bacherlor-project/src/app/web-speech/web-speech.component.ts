import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { merge, Observable, of, Subject } from 'rxjs';
import {count, map, tap} from 'rxjs/operators';
import { defaultLanguage, languages } from '../shared/model/languages';
import { SpeechError } from '../shared/model/speech-error';
import { SpeechEvent } from '../shared/model/speech-event';
import { SpeechRecognizerService } from '../shared/services/web-apis/speech-recognizer.service';
import { ActionContext } from '../shared/services/actions/action-context';
import { SpeechNotification } from '../shared/model/speech-notification';

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
  errorMessage$?: Observable<string>;
  defaultError$ = new Subject<string | undefined>();

  constructor(
    private speechRecognizer: SpeechRecognizerService,
    private actionContext: ActionContext
  ) {}

  ngOnInit(): void {
    this.totalTranscript = 'I´ve no <error id="2" type="error1"/> Idea <error id="3" type="error1"/> why <error id="2"/>. I am<error id="3"/>actually here what <error id="3" type="error2"/>about<error id="3"/> you?';
    const webSpeechReady = this.speechRecognizer.initialize(this.currentLanguage);
    if (webSpeechReady) {
      this.initRecognition();
    }else {
      this.errorMessage$ = of('Your Browser is not supported. Please try Google Chrome.');
    }
  }

  wordClicked(event: Event): void {
    const selection = window.getSelection();
    if (selection != null) {
      const range = selection.getRangeAt(0);
      console.log(range);
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
      this.saveAnnotation(globalIndexes[0], globalIndexes[1], 'error');
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
      (currentNode.parentElement != null && currentNode.parentElement.getAttribute('id') !== 'full'))) {
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
    this.insertIntoTranscript(end, `<error id="999"/>`);
    this.insertIntoTranscript(start, `<error id="9999" type="${annotationType}"/>`);
    console.log(`Start Index: ${start}, End Index: ${end}, annotationtype: ${annotationType}`);
  }

  insertIntoTranscript(index: number, text: string): void {
    let counter = 0;
    let inTag = false;
    let totalIndex = 0;
    for ( ; index > counter && totalIndex < this.totalTranscript.length; totalIndex++) {
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

  start(): void {
    if (this.speechRecognizer.isListening) {
      this.stop();
      return;
    }

    this.defaultError$.next(undefined);
    this.speechRecognizer.start();
  }

  stop(): void {
    this.speechRecognizer.stop();
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
