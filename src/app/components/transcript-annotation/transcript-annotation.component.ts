import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {merge, Observable, of, Subject, Subscription} from 'rxjs';
import {count, first, last, map, tap} from 'rxjs/operators';
import { defaultLanguage, languages } from '../../shared/model/languages';
import { SpeechEvent } from '../../shared/model/speech-event';
import { SpeechRecognizerService } from '../../shared/services/web-apis/speech-recognizer.service';
import { ActionContext } from '../../shared/services/actions/action-context';
import { SpeechNotification } from '../../shared/model/speech-notification';
import {Annotation} from '../../shared/Entities/annotation';
import {StudentAnnotationType} from '../../shared/Entities/annotation-type';
import { faMicrophone, faMicrophoneSlash, faCheckCircle,  faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import {ActivatedRoute, Router} from '@angular/router';
import {DataService} from '../../shared/services/data.service';
import {FeedbackSheet} from '../../shared/Entities/feedback-sheet';
import {BdcWalkService} from 'bdc-walkthrough';
import {ToastService} from '../../shared/services/toast.service';

@Component({
  selector: 'wsa-transcript-annotation',
  templateUrl: './transcript-annotation.component.html',
  styleUrls: ['./transcript-annotation.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TranscriptAnnotationComponent implements OnInit {

  faMicrophone = faMicrophone;
  faMicrophoneSlash = faMicrophoneSlash;
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;

  transcriptToShow = 'Flamingos usually stand on one leg, with the other being tucked beneath the body. ' +
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

  edit = false;
  SEPARATORS = ['.', ' ', ',', '!', '?'];
  languages: string[] = languages;
  currentLanguage: string = defaultLanguage;
  totalTranscript = '';
  transcript$?: Observable<string>;
  annotationTypes: string[] = [];
  activeAnnotationType = '';
  activeAnnotationPositive = false;
  activeStudent = {id: 1, name: 'John Doe', course: 'Technical English Communication A'};
  exam = {name: 'Mid Term 2020S', maxPoints: 100, reachedPoints: 0};
  showEditPopup = false;
  textToEdit = '';
  tagsInEdit: {id: number, start: boolean, type: string, positive: boolean}[] = [];
  feedbackSheet: FeedbackSheet = new FeedbackSheet(
    {id: -1, name: '', course: ''},
    {name: '', maxPoints: -1, reachedPoints: -1}, '', '', []);
  feedback = '';
  editTextIndexes: number[] = [-1, -1];
  inserted = '';
  tutorial = false;

  // Walkthrough
  id = 'transcriptWalkthorugh';
  visible = true;
  componentSubscription: Subscription | undefined;
  tasks = [
    {name: 'recordButton', title: 'This is the Record Button', done: false},
    {name: 'annotate', title: 'Annotate in Transcript', done: false},
    {name: 'selectAnnotationType', title: 'Annotate in Transcript', done: false},
    {name: 'deleteAnnotation', title: 'Delete Annotation', done: false},
    {name: 'deleteAnnotation2', title: 'Delete Annotation', done: false},
    {name: 'editWalkthrough', title: 'Edit Transcript', done: false}
  ];

  constructor(
    private speechRecognizer: SpeechRecognizerService,
    private actionContext: ActionContext,
    private router: Router,
    private dataService: DataService,
    private route: ActivatedRoute,
    private bdcWalkService: BdcWalkService,
    private toastService: ToastService
  ) {
  }

  ngOnInit(): void {
    if (this.inPortraitMode()) {
      this.toastService.show('warning', 'This app is optimized for landscape mode. Please turn your Phone!');
    }
    this.edit = this.route.snapshot.queryParamMap.get('edit') ? this.route.snapshot.queryParamMap.get('edit') === 'true' : false;
    this.tutorial = this.route.snapshot.queryParamMap.get('tutorial')
      ? this.route.snapshot.queryParamMap.get('tutorial') === 'true' : false;
    this.totalTranscript = '';
    const webSpeechReady = this.speechRecognizer.initialize(this.currentLanguage);
    if (webSpeechReady) {
      this.initRecognition();
    } else {
      this.toastService.show('error', 'Your Browser is not supported. Please try Google Chrome.');
    }
    for (const error of Object.keys(StudentAnnotationType)) {
      this.annotationTypes.push(error);
    }
    this.activeAnnotationType = this.annotationTypes[0];
    if (this.edit) {
      this.feedbackSheet = this.dataService.getFeedback();
      this.activeStudent = this.feedbackSheet.getStudent();
      this.exam = this.feedbackSheet.getExam();
      this.totalTranscript = this.feedbackSheet.getTranscript();
      this.feedback = this.feedbackSheet.getFeedbackNotes();
    } else {
      this.feedbackSheet = new FeedbackSheet(this.activeStudent, this.exam, this.totalTranscript, '', []);
    }

    // walkthrough
    if (this.tutorial) {
      this.totalTranscript = this.transcriptToShow;
      this.componentSubscription = this.bdcWalkService.changes.subscribe(() => this.onTaskChanges());
    }
  }

  // tslint:disable-next-line:typedef use-lifecycle-interface
  ngOnDestroy() {
    if (this.componentSubscription !== undefined) {
      this.componentSubscription.unsubscribe();
    }
  }

  /**
   * Refresh the Status of each walkthrough task
   */
  onTaskChanges(): void {
    this.tasks.forEach(task => task.done = this.bdcWalkService.getTaskCompleted(task.name));
    this.visible = this.bdcWalkService.getTaskCompleted(this.id);
  }

  /**
   * Toogles task visible boolean
   */
  toggleShowWalkthough(visible: boolean): void {
    this.bdcWalkService.setTaskCompleted(this.id, visible);
  }

  /**
   * resets the walkthrough
   */
  reset(): void {
    this.bdcWalkService.reset();
  }

  /**
   * changes type of annotation
   */
  changeAnnotationType(type: string): void {
    this.activeAnnotationType = type;
  }

  /**
   * toogles Edit Popup Boolean
   */
  toogleEditPopup(): void {
    this.showEditPopup = !this.showEditPopup;
  }

  /**
   * saves data to dataService
   */
  saveFeedbackAndTranscript(): void{
    this.feedbackSheet.setFeedbackNotes(this.feedback);
    this.feedbackSheet.setTranscript(this.totalTranscript);
    this.dataService.saveFeedback(this.feedbackSheet);
  }

  /**
   * saves data to dataService
   * routeToFeedback
   */
  saveAndRouteToFeedback(): void {
    this.saveFeedbackAndTranscript();
    if (this.tutorial) {
      this.reset();
      this.router.navigate(['/feedback'], {queryParams: {tutorial: true}});
    } else {
      this.router.navigate(['/feedback']);
    }
  }

  /**
   * is called when a word is marked or clicked in transcript
   * calculates indices of click
   * if annotationType is annotation saves annotation
   * if annotationType is delete deletes annotation
   * if annotationType is edit opens edit dialoge
   */
  wordClicked(event: Event): void {
    const selection = window.getSelection();
    if (selection != null) {
      // get range that is clicked
      const range = selection.getRangeAt(0);
      let globalIndexes = [-1, -1];
      // if word is clicked calculate indices (only one index is returned)
      if (range.startOffset === range.endOffset) {
        const wordIndexes = this.getWordIndexByChar(range.startContainer.textContent, range.startOffset);
        if (wordIndexes[0] !== -1 && wordIndexes[1] !== -1) {
          globalIndexes = this.getGlobalIndex(range.startContainer, wordIndexes[0], range.endContainer, wordIndexes[1]);
        }
      } else { // if more than one word is clicked
        globalIndexes = this.getGlobalIndex(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
      }
      // if annotation type is selected save annotation
      if (this.activeAnnotationType !== 'delete' && this.activeAnnotationType !== 'edit') {
        this.saveAnnotation(globalIndexes[0], globalIndexes[1],
          this.activeAnnotationType.split(' ').join(''), this.activeAnnotationPositive);
      } else if (this.activeAnnotationType === 'delete') {
        globalIndexes = this.transformIndexesToOffset(globalIndexes);
        this.deleteNextAnnotationInTranscript(globalIndexes[0], globalIndexes[1]);
      } else if (this.activeAnnotationType === 'edit') {
        globalIndexes = this.transformIndexesToOffset(globalIndexes);
        this.editMarkedText(globalIndexes[0], globalIndexes[1]);
      }
    }
  }

  /**
   *
   * @param startIndex
   * @param endIndex
   * @private
   */
  private editMarkedText(startIndex: number, endIndex: number): void {
    this.toogleEditPopup();
    this.editTextIndexes = [startIndex, endIndex];
    this.textToEdit = this.totalTranscript.substr(startIndex, endIndex - startIndex);
    this.tagsInEdit = Annotation.getAllTagsFromString(this.textToEdit);
  }

  confirmEditText(): void {
    // check if Tags were edited
    const tempTags: {id: number, start: boolean, type: string, positive: boolean}[]
      = Annotation.getAllTagsFromString(this.textToEdit);
    // sort arrays
    this.tagsInEdit.sort((a, b) => {
      return a.id > b. id ? 1 : a.id < b.id ? -1 : a.start ? 1 : b.start ? -1 : 0;
    });
    tempTags.sort((a, b) => {
      return a.id > b. id ? 1 : a.id < b.id ? -1 : a.start ? 1 : b.start ? -1 : 0;
    });
    let indexA = 0;
    let indexB = 0;
    let idsToDelete: number[] = [];
    // search for deleted or inserted tags
    while (indexA < this.tagsInEdit.length && indexB < tempTags.length) {
      const tagA = this.tagsInEdit[indexA];
      const tagB = tempTags[indexB];
      if (tagA.id === tagB.id) {
        if (tagA.start === tagB.start) {
          indexA++;
          indexB++;
        } else if (tagA) {
          idsToDelete.push(tagA.id);
          indexA++;
        } else {
          idsToDelete.push(tagB.id);
          indexB++;
        }
      } else if (tagA.id > tagB.id) {
        idsToDelete.push(tagA.id);
        indexA++;
      } else {
        idsToDelete.push(tagB.id);
        indexB++;
      }
    }
    if (indexB < tempTags.length) {
      for (; indexB < tempTags.length; indexB++) {
        idsToDelete.push(tempTags[indexB].id);
      }
    } else {
      for (; indexA < this.tagsInEdit.length; indexA++) {
        idsToDelete.push(this.tagsInEdit[indexA].id);
      }
    }
    this.changeTranscript(this.editTextIndexes[0], this.editTextIndexes[1], this.textToEdit);
    if (idsToDelete.length > 0) {
      // distinct values
      idsToDelete = idsToDelete.filter((n, i) => idsToDelete.indexOf(n) === i);
      let annotations = Annotation.getAnnotationsFromString(this.totalTranscript);
      annotations = annotations.filter(item => idsToDelete.indexOf(item.getId()) !== -1);
      this.deleteAnnotationsFromTranscript(annotations);
    }
    this.totalTranscript = this.getWellformedTranscript(this.totalTranscript);
    this.toogleEditPopup();
    this.textToEdit = '';
    this.editTextIndexes = [-1, -1];
  }

  /**
   * checks if Transcript is well formed (no open tags, all tags are in right format)
   */
  getWellformedTranscript(text: string): string {
    // ToDo: make wellformed transcript -> check for open Tags and tags not fitting regex
    let open = false;
    let tempText = text;
    let lastOpenIndex = -1;
    let closeTagIndex = tempText.search('>');
    let openTagIndex = tempText.search('<');
    let offset = 0;
    // check if every openTag is followed by a closingTag
    while (closeTagIndex !== -1 || openTagIndex !== -1) {
      // only close Tag in Text
      if (openTagIndex === -1) {
        // if last Tag closing and Tag is opened -> close Tag
        if (open) {
          open = false;
          offset += closeTagIndex + 1;
        } else { // no Tag open but closing Tag -> delete Tag
          text = text.substr(0, offset + closeTagIndex) + text.substr(offset + closeTagIndex + 1);
          offset += closeTagIndex;
        }
        tempText = tempText.substr(closeTagIndex + 1); // always +1 because not deleted in tempText
      } else if (closeTagIndex === -1) {
        // only open Tag in Text -> delete
        text = text = text.substr(0, offset + openTagIndex) + text.substr(offset + openTagIndex + 1);
        tempText = tempText.substr(openTagIndex);
        offset += openTagIndex;
        tempText = tempText.substr(openTagIndex + 1);
      } else if (closeTagIndex < openTagIndex) {
        // closeTag before open Tag
        if (open) {
          // tag is open -> close it
          open = false;
          offset += closeTagIndex + 1;
        } else {
          // no tag open -> delete
          text = text.substr(0, offset + closeTagIndex) + text.substr(offset + closeTagIndex + 1);
          offset += closeTagIndex;
        }
        tempText = tempText.substr(closeTagIndex + 1);
      } else if (closeTagIndex >= openTagIndex) {
        // open tag before close tag
        if (open) {
          // tag is already open -> remove last opening Tag
          text = text.substr(0, lastOpenIndex) + text.substr(lastOpenIndex + 1);
          offset += openTagIndex;
        } else {
          // tag is closed -> open Tag
          open = true;
          lastOpenIndex = offset + openTagIndex;
          offset += openTagIndex + 1;
        }
        tempText = tempText.substr(openTagIndex + 1);
      }
      closeTagIndex = tempText.search('>');
      openTagIndex = tempText.search('<');
    }
    // check if all Tags are in right format
    const regexStartTag = /<annotation id="\d*" type="\w*" positive="\w*"\/>/;
    const regexEndTag = /<annotation id="\d*"\/>/;
    tempText = text;
    offset = 0;
    let tagRegex = this.getLowestIndex(tempText.search(regexStartTag), tempText.search(regexEndTag));
    openTagIndex = tempText.search('<');
    while (openTagIndex !== -1) {
      const closeTag = tempText.search('>');
      if (tagRegex === -1 || openTagIndex < tagRegex) {
        text = text.substr(0, offset + closeTag) + text.substr(offset + closeTag + 1);
        text = text.substr(0, offset + openTagIndex) + text.substr(offset + openTagIndex + 1);
        offset += closeTag - 1; // -1 because 2 chars are deleted
      } else {
        offset += closeTag + 1;
      }
      tempText = tempText.substr(closeTag + 1);
      tagRegex = this.getLowestIndex(tempText.search(regexStartTag), tempText.search(regexEndTag));
      openTagIndex = tempText.search('<');
    }
    console.log(text);
    return text;
  }

  /**
   * returns lowest Index that is not -1
   * @param indexA
   * @param indexB
   */
  getLowestIndex(indexA: number, indexB: number): number {
    if (indexA === -1 && indexB === -1) {
      return -1;
    } else if (indexA === -1) {
      return indexB;
    } else if (indexB === -1) {
      return indexA;
    } else if (indexA < indexB) {
      return indexA;
    } else {
      return indexB;
    }
  }

  private changeTranscript(startIndex: number, endIndex: number, insert: string): void {
    this.deleteFromTranscript(startIndex, endIndex);
    this.totalTranscript = [this.totalTranscript.slice(0, startIndex), insert, this.totalTranscript.slice(startIndex)].join('');
  }

  /**
   * returns start (incl.) and end index (excl.) of selected word
   * @param text of analyzed string
   * @param charIndex of selected char
   */
  private getWordIndexByChar(text: string | null, charIndex: number): number[] {
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

  /**
   * returns start and end indices of chosen containers
   * @param startContainer of selected word
   * @param start index
   * @param endContainer of selected word
   * @param end index
   */
  private getGlobalIndex(startContainer: Node, start: number, endContainer: Node, end: number): number[] {
    const indexesFront = this.getIndicesBefore(startContainer);
    const indexesBack = this.getIndicesBefore(endContainer);
    return [indexesFront + start, indexesBack + end];
  }

  /**
   * returns index of char at the start of parent Node
   * @param node that was clicked
   */
  private getIndicesBefore(node: Node): number {
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
   * saves annotation
   * @param start index
   * @param end index
   * @param annotationType
   */
  private saveAnnotation(start: number, end: number, annotationType: string, positive: boolean): void {
    const newId = Annotation.getNewId(Annotation.getAnnotationsFromString(this.totalTranscript));
    this.insertIntoTranscript(end, `<annotation id="${newId}"/>`);
    this.insertIntoTranscript(start, `<annotation id="${newId}" type="${annotationType}" positive="${positive}"/>`);
  }

  /**
   * insert text into transcript
   * @param index insertion
   * @param text that is inserted
   */
  private insertIntoTranscript(index: number, text: string): void {
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

  /**
   * calculates Indexes with annotation tags
   * precondition = indexes[0] < indexes[1]
   * @param indexes without annotation tags
   * @return indexes with annotation tags
   * @private
   */
  private transformIndexesToOffset(indexes: number[]): number[] {
    const tempIndexes = [-1, -1];
    let offset = 0;
    let inTag = false;
    let firstIndexCalculated = false;
    // count offset++ if inTag or at end from tag
    for (let i = 0; i - offset <= indexes[1]; i++) {
      // if position in text minus calculated offset is bigger than first index -> recalculate index
      if (i - offset >= indexes[0] && !firstIndexCalculated) {
        tempIndexes[0] = indexes[0] + offset;
        firstIndexCalculated = true;
      }
      if (this.totalTranscript[i] === '<') {
        inTag = true;
      } else if (this.totalTranscript[i] === '>') {
        inTag = false;
        offset++;
      }
      if (inTag) {
        offset++;
      }
    }
    // recalculate index 2
    tempIndexes[1] = indexes[1] + offset;
    return tempIndexes;
  }

  /**
   * deletes all Annotations that start or end inside the Indexes.
   * if no annotation is inside it deletes annotation that starts nearest at intervall and doesn't end before endIndex
   * @param startIndex of user selection
   * @param endIndex of user selection
   */
  private deleteNextAnnotationInTranscript(startIndex: number, endIndex: number): void {
    const currentAnnotations = Annotation.getAnnotationsFromString(this.totalTranscript);
    const deleteAnnotations: Annotation[] = [];
    let firstAnnotationOutside: Annotation = new Annotation(-1, '', -1, -1, '', -1, -1, false);
    // delete all annotations inside
    for (const annotation of currentAnnotations) {
      if (annotation.getStartIndex() >= startIndex && annotation.getEndIndex() <= endIndex) {
        deleteAnnotations.push(annotation);
      }
      if (annotation.getStartIndex() <= startIndex && annotation.getEndIndex() >= endIndex) {
        if (firstAnnotationOutside.getId() === -1 || firstAnnotationOutside.getStartIndex() < annotation.getStartIndex()){
          firstAnnotationOutside = annotation;
        }
      }
    }
    if (deleteAnnotations.length !== 0) {
      this.deleteAnnotationsFromTranscript(deleteAnnotations);
    } else {
      this.deleteAnnotationsFromTranscript([firstAnnotationOutside]);
    }
  }

  /**
   * delete annotations from Transcript
   * @param annotations that should be deleted from Transcript
   */
  private deleteAnnotationsFromTranscript(annotations: Annotation[]): void {
    console.log(annotations);
    if (annotations.length <= 0) { return; }
    const deleteIndexes: {startIndex: number, endIndex: number}[] = [];
    annotations.forEach(annotation => {
      deleteIndexes.push({
        startIndex: annotation.getEndIndex() - annotation.getOffsetBack() - 1,
        endIndex: annotation.getEndIndex()
      });
      deleteIndexes.push({
        startIndex: annotation.getStartIndex(),
        endIndex: annotation.getStartIndex() + annotation.getOffsetFront()
      });
    });
    deleteIndexes.sort((a, b) => {
      return a.startIndex > b.startIndex ? -1 : a.startIndex < b.startIndex ? 1 : 0;
    });
    console.log(deleteIndexes);
    deleteIndexes.forEach(index => this.deleteFromTranscript(index.startIndex, index.endIndex));
  }

  /**
   * sets activeAnnotationPositive to value
   * @param value
   */
  setActiveAnnotationPositive(value: boolean): void {
    this.activeAnnotationPositive = value;
  }

  /**
   * deletes from Transcript
   * @param startIndex of first letter deleted
   * @param endIndex of last letter deleted
   */
  private deleteFromTranscript(startIndex: number, endIndex: number): void {
    if (startIndex >= 0 && endIndex >= 0 && startIndex <= endIndex) {
      this.totalTranscript = this.totalTranscript.substr(0, startIndex) +
        this.totalTranscript.substr(endIndex);
    }
  }

  /**
   * returns false if inserted text equals temporary text
   */
  showTemporaryText(): boolean {
    const element = document.getElementById('temporaryText');
    if (element) {
      let recordedText = element.innerHTML;

      // after first time inserted space has to be removed
      if (recordedText[0] === ' ') {
        recordedText = recordedText.substr(1, recordedText.length - 1);
      }
      let insertedText = this.inserted;
      if (insertedText[0] === ' ') {
        insertedText = insertedText.substr(1, insertedText.length - 1);
      }
      if (recordedText === insertedText) {
        return false;
      }
    }
    return true;
  }

  /**
   * toggles between listening and not listening
   */
  toggleListening(): void {
    if (this.isListening) {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * starts transcript recording when not recording
   * ends recording if already recording
   */
  private start(): void {
    if (this.isListening) {
      this.stop();
      return;
    }
    this.speechRecognizer.start();
  }

  /**
   * stops recording of transcript
   */
  private stop(): void {
    this.speechRecognizer.stop();
  }

  /**
   * initialise recognition
   */
  private initRecognition(): void {
    this.transcript$ = this.speechRecognizer.onResult().pipe(
      tap((notification) => {
        this.processNotification(notification);
      }),
      map((notification) => notification.content || '')
    );
  }

  /**
   * process speech segment that was recorded
   * @param notification contains text that was recorded
   * @private
   */
  private processNotification(notification: SpeechNotification<string>): void {
    if (notification.event === SpeechEvent.FinalContent) {
      const message = notification.content?.trim() || '';
      this.actionContext.processMessage(message, this.currentLanguage);
      // this.actionContext.runAction(message, this.currentLanguage);
      this.inserted = message;
      if (this.totalTranscript === '') {
        this.totalTranscript = `${message}`;
      } else {
        this.totalTranscript = `${this.totalTranscript} ${message}.`;
      }
    }
  }

  get isListening(): boolean {
    return this.speechRecognizer.isListening;
  }

  /**
   * returns true if display is in landscape mode
   */
  inPortraitMode(): boolean {
    return window.innerHeight > window.innerWidth;
  }
}
