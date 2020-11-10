import { Injectable } from '@angular/core';
import {FeedbackSheet} from '../Entities/feedback-sheet';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  feedbackSheet: FeedbackSheet = new FeedbackSheet(
    {id: -1, name: '', course: ''},
    {name: '', maxPoints: -1, reachedPoints: -1}, '', '');

  constructor() { }
  saveFeedback(feedback: FeedbackSheet): void {
    this.feedbackSheet = feedback;
  }
  getFeedback(): FeedbackSheet {
    return this.feedbackSheet;
  }
}
