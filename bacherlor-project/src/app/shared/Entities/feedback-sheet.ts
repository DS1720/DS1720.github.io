export class FeedbackSheet {
  constructor(
    private student: {id: number, name: string, course: string},
    private exam: {name: string, maxPoints: number, reachedPoints: number},
    private transcript: string,
    private feedbackNotes: string
  ) {
  }

  getStudent(): {id: number, name: string, course: string} {
    return this.student;
  }

  setStudent(value: {id: number, name: string, course: string}): void {
    this.student = value;
  }

  getExam(): {name: string, maxPoints: number, reachedPoints: number} {
    return this.exam;
  }

  setExam(value: {name: string, maxPoints: number, reachedPoints: number}): void {
    this.exam = value;
  }

  getTranscript(): string {
    return this.transcript;
  }

  setTranscript(value: string): void {
    this.transcript = value;
  }

  getFeedbackNotes(): string {
    return this.feedbackNotes;
  }

  setFeedbackNotes(value: string): void {
    this.feedbackNotes = value;
  }
}
