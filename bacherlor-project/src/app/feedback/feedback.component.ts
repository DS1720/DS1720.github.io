import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {DataService} from '../shared/services/data.service';
import {FeedbackSheet} from '../shared/Entities/feedback-sheet';
import {faPlus, faMinus} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'wsa-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {

  faPlus = faPlus;
  faMinus = faMinus;

  edit = true;
  feedbackSheet: FeedbackSheet = new FeedbackSheet(
    {id: 1, name: 'John Doe', course: 'Technical English Communication A'},
    {name: 'Mid Term 2020S', maxPoints: 100, reachedPoints: 0},
    '<error id="0" type="pronunciation" positive="false"/>Flamingos<error id="0"/> usually stand on one leg, with the other being tucked beneath the body. The <error id="8" type="pronunciation" positive="false"/>reason<error id="8"/> for this behaviour is not fully understood. One <error id="14" type="pronunciation" positive="true"/>theory<error id="14"/> is that standing on one leg all<error id="2" type="wordchoice" positive="false"/>ows the <error id="1" type="grammar" positive="true"/>birds<error id="1"/> to conserve <error id="2"/>more body heat, given that they spend a significant amount of time wading in cold water. However, the behaviour also takes place in warm water and is also observed in birds that do not typically stand in water. An alternative theory is that standing on one leg reduces the energy expenditure for producing muscular <error id="19" type="tense" positive="true"/>effort<error id="19"/> to stand and balance on one leg. A study on cadavers showed that the one-legged pose could be held without any muscle activity, while living flamingos demonstrate substantially less body sway in a one-legged posture. As well as standing in the water, flamingos may stamp their webbed feet in the mud to stir up food from the bottom. <error id="15" type="grammar" positive="true"/>Flamingos are capable flyers, and flamingos in captivity often<error id="15"/> require wing clipping to prevent escape. A <error id="3" type="wordchoice" positive="true"/>pair<error id="3"/> of African flamingos which had not yet had their wings clipped escaped from the Wichita, Kansas zoo in 2005. One was spotted in Texas 14 years later. Young flamingos hatch <error id="13" type="grammar" positive="false"/>with grayish-red plumage, but adults range from<error id="13"/> light pink to bright red due to aqueous bacteria and <error id="17" type="wordchoice" positive="true"/>beta-carotene<error id="17"/> obtained from their food supply. A well-fed, healthy flamingo is more vibrantly colored, thus a more desirable mate; a white or pale flamingo, however, is <error id="9" type="pronunciation" positive="false"/>usually<error id="9"/> unhealthy or malnourished. Captive flamingos are a notable exception; they may turn a pale pink if they are not fed carotene at levels comparable to the wild. Flamingoes can open their bills by raising the <error id="7" type="grammar" positive="false"/>upper<error id="7"/> jaw as well as by dropping the lower.Flamingos usually stand on one leg, with the other being tucked beneath the body. The reason for this behaviour is not fully <error id="6" type="grammar" positive="false"/>understood<error id="6"/>. One theory is that standing on one leg allows the birds to conserve more body heat, given that they spend a significant amount of time wading in cold water. However, the behaviour also takes place in warm water and is also observed in birds that do not typically stand in <error id="4" type="tense" positive="false"/>water<error id="4"/>. An alternative theory is that standing on one leg reduces the energy <error id="16" type="wordchoice" positive="true"/>expenditure for producing muscular<error id="16"/> effort to stand and balance on one leg. A study on cadavers showed that the one-legged pose could be held without any muscle activity, while living flamingos demonstrate substantially less body sway in a one-legged posture. <error id="12" type="tense" positive="false"/>As well as standing in the water, flamingos may<error id="12"/> stamp their webbed feet in the mud to stir up food from the bottom. Flamingos are capable flyers, and flamingos in captivity often require wing clipping to prevent escape. A pair of African flamingos which had not yet had their wings clipped escaped from the Wichita, Kansas zoo in 2005. One was spotted in Texas 14 years later. Young <error id="11" type="wordchoice" positive="false"/>flamingos hatch with grayish-red plumage,<error id="11"/> but adults range from light pink to bright red due to aqueous bacteria and beta-carotene obtained from their food supply. A well-fed, healthy flamingo is more vibrantly colored, thus a more desirable mate; a white or pale flamingo, however, is usually unhealthy or malnourished. Captive flamingos are a notable exception; they may turn a pale pink <error id="5" type="tense" positive="false"/>if<error id="5"/> they are not fed carotene at levels comparable to the wild. Flamingoes <error id="18" type="tense" positive="true"/>can<error id="18"/> open their bills <error id="10" type="pronunciation" positive="false"/>by raising the upper jaw as well as by dropping<error id="10"/> the lower.',
    'Nice Work but try better next time!');
  showTranscript = false;

  constructor(
    private router: Router,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    // this.feedbackSheet = this.dataService.getFeedback();
  }

  /**
   * toogles showTranscript and css
   */
  toggleShowTranscript(): void {
    this.showTranscript = !this.showTranscript;
  }

  /**
   * routes to Exam
   */
  routeToExam(): void {
    this.router.navigate(['/exam']);
  }

}
