import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActionStrategy } from './action-strategy';

@Injectable({
  providedIn: 'root',
})
export class ChangeTitleStrategy extends ActionStrategy {
  private title?: Title;

  constructor() {
    super();
    this.mapStartSignal.set('en-US', 'perform change title');

    this.mapEndSignal.set('en-US', 'finish change title');

    this.mapInitResponse.set('en-US', 'Please, tell me the new title');

    this.mapActionDone.set('en-US', 'Changing title of the Application to');
  }

  set titleService(title: Title) {
    this.title = title;
  }

  runAction(input: string, language: string): void {
    this.title?.setTitle(input);
  }
}
