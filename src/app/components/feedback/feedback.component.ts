import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DataService} from '../../shared/services/data.service';
import {FeedbackSheet} from '../../shared/Entities/feedback-sheet';
import {faPlus, faMinus, faHome, faEdit, faUserGraduate, faSave, faSignOutAlt} from '@fortawesome/free-solid-svg-icons';
import {Annotation} from '../../shared/Entities/annotation';
import {Subscription} from 'rxjs';
import {BdcWalkService} from 'bdc-walkthrough';
import {NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {ToastService} from '../../shared/services/toast.service';

@Component({
  selector: 'wsa-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {

  faPlus = faPlus;
  faMinus = faMinus;
  faHome = faHome;
  faEdit = faEdit;
  faUserGraduate = faUserGraduate;
  faSave = faSave;
  faSignOutAlt = faSignOutAlt;

  edit = true;
  feedbackSheetToShow: FeedbackSheet = new FeedbackSheet(
    {id: 1, name: 'John Doe', course: 'Technical English Communication A'},
    {name: 'Mid Term 2020S', maxPoints: 100, reachedPoints: 0},
    '<annotation id="0" type="pronunciation" positive="false"/>Flamingos<annotation id="0"/> usually stand on one leg, with the other being tucked beneath the body. The <annotation id="8" type="pronunciation" positive="false"/>reason<annotation id="8"/> for this behaviour is not fully understood. One <annotation id="14" type="pronunciation" positive="true"/>theory<annotation id="14"/> is that standing on one leg all<annotation id="2" type="wordchoice" positive="false"/>ows the <annotation id="1" type="grammar" positive="true"/>birds<annotation id="1"/> to conserve <annotation id="2"/>more body heat, given that they spend a significant amount of time wading in cold water. However, the behaviour also takes place in warm water and is also observed in birds that do not typically stand in water. An alternative theory is that standing on one leg reduces the energy expenditure for producing muscular <annotation id="19" type="tense" positive="true"/>effort<annotation id="19"/> to stand and balance on one leg. A study on cadavers showed that the one-legged pose could be held without any muscle activity, while living flamingos demonstrate substantially less body sway in a one-legged posture. As well as standing in the water, flamingos may stamp their webbed feet in the mud to stir up food from the bottom. <annotation id="15" type="grammar" positive="true"/>Flamingos are capable flyers, and flamingos in captivity often<annotation id="15"/> require wing clipping to prevent escape. A <annotation id="3" type="wordchoice" positive="true"/>pair<annotation id="3"/> of African flamingos which had not yet had their wings clipped escaped from the Wichita, Kansas zoo in 2005. One was spotted in Texas 14 years later. Young flamingos hatch <annotation id="13" type="grammar" positive="false"/>with grayish-red plumage, but adults range from<annotation id="13"/> light pink to bright red due to aqueous bacteria and <annotation id="17" type="wordchoice" positive="true"/>beta-carotene<annotation id="17"/> obtained from their food supply. A well-fed, healthy flamingo is more vibrantly colored, thus a more desirable mate; a white or pale flamingo, however, is <annotation id="9" type="pronunciation" positive="false"/>usually<annotation id="9"/> unhealthy or malnourished. Captive flamingos are a notable exception; they may turn a pale pink if they are not fed carotene at levels comparable to the wild. Flamingoes can open their bills by raising the <annotation id="7" type="grammar" positive="false"/>upper<annotation id="7"/> jaw as well as by dropping the lower.Flamingos usually stand on one leg, with the other being tucked beneath the body. The reason for this behaviour is not fully <annotation id="6" type="grammar" positive="false"/>understood<annotation id="6"/>. One theory is that standing on one leg allows the birds to conserve more body heat, given that they spend a significant amount of time wading in cold water. However, the behaviour also takes place in warm water and is also observed in birds that do not typically stand in <annotation id="4" type="tense" positive="false"/>water<annotation id="4"/>. An alternative theory is that standing on one leg reduces the energy <annotation id="16" type="wordchoice" positive="true"/>expenditure for producing muscular<annotation id="16"/> effort to stand and balance on one leg. A study on cadavers showed that the one-legged pose could be held without any muscle activity, while living flamingos demonstrate substantially less body sway in a one-legged posture. <annotation id="12" type="tense" positive="false"/>As well as standing in the water, flamingos may<annotation id="12"/> stamp their webbed feet in the mud to stir up food from the bottom. Flamingos are capable flyers, and flamingos in captivity often require wing clipping to prevent escape. A pair of African flamingos which had not yet had their wings clipped escaped from the Wichita, Kansas zoo in 2005. One was spotted in Texas 14 years later. Young <annotation id="11" type="wordchoice" positive="false"/>flamingos hatch with grayish-red plumage,<annotation id="11"/> but adults range from light pink to bright red due to aqueous bacteria and beta-carotene obtained from their food supply. A well-fed, healthy flamingo is more vibrantly colored, thus a more desirable mate; a white or pale flamingo, however, is usually unhealthy or malnourished. Captive flamingos are a notable exception; they may turn a pale pink <annotation id="5" type="tense" positive="false"/>if<annotation id="5"/> they are not fed carotene at levels comparable to the wild. Flamingoes <annotation id="18" type="tense" positive="true"/>can<annotation id="18"/> open their bills <annotation id="10" type="pronunciation" positive="false"/>by raising the upper jaw as well as by dropping<annotation id="10"/> the lower.',
    '', []);
  feedbackSheet: FeedbackSheet = new FeedbackSheet(
    {id: -1, name: '', course: ''},
    {name: '', maxPoints: -1, reachedPoints: -1},
    '', '', []);
  showTranscript = false;

  // Walkthrough
  tutorial = false;
  id = 'transcriptWalkthorugh';
  visible = true;
  componentSubscription: Subscription | undefined;
  tasks = [
    {name: 'transcript', title: 'This is the Record Button', done: false},
    {name: 'annotations', title: 'This is the Record Button', done: false},
    {name: 'notes', title: 'This is the Record Button', done: false},
    {name: 'points', title: 'This is the Record Button', done: false},
    {name: 'studentView', title: 'This is the Record Button', done: false},
    {name: 'end', title: 'This is the Record Button', done: false}
  ];

  constructor(
    private router: Router,
    private dataService: DataService,
    private bdcWalkService: BdcWalkService,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.tutorial = this.route.snapshot.queryParamMap.get('tutorial')
      ? this.route.snapshot.queryParamMap.get('tutorial') === 'true' : false;
    if (this.tutorial) {
      this.feedbackSheet = this.feedbackSheetToShow;
      this.componentSubscription = this.bdcWalkService.changes.subscribe(() => this.onTaskChanges());
    } else {
      this.feedbackSheet = this.dataService.getFeedback();
    }
    const transcript = this.feedbackSheet.getTranscript();
    const annotations = Annotation.getAnnotationsFromString(transcript);
    const annotationArray: {annotation: Annotation, annotationText: string, comment: string, links: string[]}[] = [];
    let counter = 0;
    annotations.forEach(annotation => {
      annotationArray.push({
        annotation,
        annotationText: this.getAnnotationText(annotation, transcript),
        comment: '',
        links: []
      });
      counter++;
    });
    annotationArray.sort((a, b) => {
      if (a.annotation.getPositive() && !b.annotation.getPositive()) {
        return -1;
      } else if (!a.annotation.getPositive() && b.annotation.getPositive()) {
        return 1;
      }
      return a.annotation.getId() < b.annotation.getId() ? -1 : a.annotation.getId() > b.annotation.getId() ? 1 : 0;
    });
    this.feedbackSheet.setAnnotations(annotationArray);
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
   * sets tutorial boolean on false
   */
  finishTutorial(): void {
    this.tutorial = false;
  }

  /**
   * returns 3 words before and 3 words after annotation, without any other annotationTags inside
   */
  getAnnotationText(annotation: Annotation, transcript: string): string {
    let firstIndex = annotation.getStartIndex();
    let lastIndex = annotation.getEndIndex();
    for (let spaces = 0, insideTag = false; firstIndex > 0 && spaces <= 4; firstIndex--) {
      if (!insideTag && transcript[firstIndex] === '>') {
        insideTag = true;
      } else if (insideTag && transcript[firstIndex] === '<') {
        insideTag = false;
      } else if (!insideTag && transcript [firstIndex] === ' ') {
        spaces++;
      }
    }
    if (firstIndex !== 0 && firstIndex + 2 < transcript.length) {
      firstIndex += 2;
    }
    for (let spaces = 0, insideTag = false; lastIndex < transcript.length && spaces <= 4; lastIndex++) {
      if (!insideTag && transcript[lastIndex] === '<') {
        insideTag = true;
      } else if (insideTag && transcript[lastIndex] === '>') {
        insideTag = false;
      } else if (!insideTag && transcript[lastIndex] === ' ') {
        spaces++;
      }
    }
    return Annotation.deleteTagsFromOtherAnnotations(annotation.getId(), transcript.substr(firstIndex, lastIndex - firstIndex));
  }

  /**
   * toogles showTranscript and css
   */
  toggleShowTranscript(): void {
    this.showTranscript = !this.showTranscript;
  }

  /**
   * routes to Exam
   * @param in edit mode or not
   */
  routeToExam(editMode: boolean): void {
    if (this.tutorial) {
      this.toastService.show('warning', 'This button is disabled in Tutorial!');
      return;
    }
    if (editMode) {
      this.router.navigate(['/exam'], {queryParams: {edit: true}});
    } else {
      this.router.navigate(['/exam']);
    }
  }

  /**
   * returns number of annotationItems of type
   * @param type of annotationItems
   */
  countAnnotationItems(type: string): number {
    let counter = 0;
    this.feedbackSheet.getAnnotations().forEach(annotationItem => {
      if (annotationItem.annotation.getType() === type) {
        counter++;
      }
    });
    return counter;
  }

  /**
   * tooggle edit mode
   */
  toggleEdit(): void {
    this.edit = !this.edit;
  }

  /**
   * saves Feedback and navigates to transcript editor
   */
  editTranscript(): void {
    this.routeToExam(true);
  }

  /**
   * saves Feedback
   */
  save(): void {
    if (!this.tutorial) {
      this.dataService.saveFeedback(this.feedbackSheet);
    } else {
      this.toastService.show('warning', 'This button is disabled in Tutorial!');
    }
  }

  /**
   * saves Feedback and routes to Home
   */
  saveAndExit(): void {
    if (!this.tutorial) {
      this.save();
      this.routeToExam(false);
    } else {
      this.toastService.show('warning', 'This button is disabled in Tutorial!');
    }
  }

  /**
   * check if 100 Points are awarded
   */
  pointsAwarded(): boolean {
    return this.feedbackSheet.getExam().reachedPoints === 100;
  }
}
