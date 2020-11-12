import {EventEmitter, Injectable, NgZone, Output} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';

import { SpeechNotification } from '../../model/speech-notification';
import { SpeechEvent } from '../../model/speech-event';
import { AppWindow } from '../../model/app-window';
import {ToastService} from '../toast.service';
// tslint:disable-next-line:no-any
const { webkitSpeechRecognition }: AppWindow = (window as any) as AppWindow;

@Injectable({
  providedIn: 'root',
})
export class SpeechRecognizerService {
  recognition!: SpeechRecognition;
  language!: string;
  isListening = false;

  constructor(private ngZone: NgZone, private toastService: ToastService) {
  }

  /**
   * initialize speech recognition with language
   * @param language of speech recognition
   */
  initialize(language: string): boolean {
    this.isListening = false;
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.setLanguage(language);
      this.recognition.addEventListener('end', () => {
        this.isListening = false;
        this.toastService.show('warning', 'Recording Stopped', 10000);
      });
      this.recognition.addEventListener('start', () => {
        this.toastService.show('warning', 'Recording Started');
      });

      this.recognition.onerror = (event) => {
        // tslint:disable-next-line:no-any
        const eventError: string = (event as any).error;
        console.log('error', eventError);
        switch (eventError) {
          case 'no-speech':
            this.toastService.show('error', `No speech has been detected. Please try again.`);
            break;
          case 'audio-capture':
            this.toastService.show('error', `Microphone is not available. Please verify the connection of your microphone and try again.`);
            break;
          case 'not-allowed':
            this.toastService.show('error', `Your browser is not authorized to access your microphone.
            Verify that your browser has access to your microphone and try again.`);
            break;
          case 'network':
            this.toastService.show('error', `A network communication is needed for the recognition.`);
            break;
          default:
            this.toastService.show('error', `An unknown error occured.`);
            break;
        }
      };
      return true;
    }

    return false;
  }


  /**
   * sets language of speech recognition
   * @param language of speech recognition
   */
  setLanguage(language: string): void {
    this.language = language;
    this.recognition.lang = language;
  }

  /**
   * starts recognition
   */
  start(): void {
    if (!this.recognition) {
      return;
    }
    this.recognition.start();
    this.isListening = true;
  }

  /**
   * returns observable that deals with the result
   */
  onResult(): Observable<SpeechNotification<string>> {
    return new Observable(observer => {
      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimContent = '';
        let finalContent = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalContent += event.results[i][0].transcript;
            this.ngZone.run(() => {
              observer.next({
                event: SpeechEvent.FinalContent,
                content: finalContent
              });
            });
          } else {
            interimContent += event.results[i][0].transcript;
            // console.log('interim transcript', event, interimContent);
            this.ngZone.run(() => {
              observer.next({
                event: SpeechEvent.InterimContent,
                content: interimContent
              });
            });
          }
        }
      };
    });
  }

  /**
   * stops recognition
   */
  stop(): void {
    this.recognition.stop();
    this.isListening = false;
  }
}
