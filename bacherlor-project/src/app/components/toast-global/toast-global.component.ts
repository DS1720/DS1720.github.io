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

}
