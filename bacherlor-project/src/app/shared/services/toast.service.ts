import { Injectable, TemplateRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  // tslint:disable-next-line:no-any
  toasts: any[] = [];

  show(type: string, body: string, delay?: number): void {
    this.toasts.push({ type, body, delay });
  }

  // tslint:disable-next-line:no-any
  remove(toast: any): void {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}
