import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {DataService} from '../shared/services/data.service';

@Component({
  selector: 'wsa-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {

  feedbackNotes = '';
  transcript = '';

  constructor(
    private router: Router,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.transcript = this.dataService.getTranscript();
    this.feedbackNotes = this.dataService.getFeedback();
  }

  /**
   * routes to Exam
   */
  routeToExam(): void {
    this.router.navigate(['/exam']);
  }

}
