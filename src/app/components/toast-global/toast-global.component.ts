import { Component, OnInit } from '@angular/core';
import {ToastService} from '../../shared/services/toast.service';

@Component({
  selector: 'wsa-toast-global',
  templateUrl: './toast-global.component.html',
  styleUrls: ['./toast-global.component.css']
})
export class ToastGlobalComponent implements OnInit {

  constructor(public toastService: ToastService) { }

  ngOnInit(): void {
  }

  // tslint:disable-next-line:no-any
  getClass(toast: any): string {
    if (toast.type && toast.type === 'error') {
      return 'bg-danger text-light';
    } else if (toast.type && toast.type === 'warning') {
      return 'bg-warning text-dark';
    }
    else if (toast.type && toast.type === 'info') {
      return 'bg-info text-light';
    } else if (toast.type && toast.type === 'success') {
      return 'bg-success text-light';
    }
    return '';
  }

}
