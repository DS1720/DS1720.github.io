import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  transcript = '';
  feedback = '';
  constructor() { }
  saveFeedback(feedback: string): void {
    this.feedback = feedback;
  }
  saveTranscript(transcript: string): void {
    this.transcript = transcript;
  }
  getFeedback(): string {
    return this.feedback;
  }
  getTranscript(): string {
    return this.transcript;
  }
}
