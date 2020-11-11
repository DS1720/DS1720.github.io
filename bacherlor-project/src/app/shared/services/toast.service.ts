import { Injectable, TemplateRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  // tslint:disable-next-line:no-any
  toasts: any[] = [];

  show(header: string, body: string): void {
    this.toasts.push({ header, body });
  }

  // tslint:disable-next-line:no-any
  remove(toast: any): void {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}
