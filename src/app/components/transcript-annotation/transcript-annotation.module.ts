import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranscriptAnnotationComponent } from './transcript-annotation.component';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule} from '@angular/forms';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {BdcWalkModule} from 'bdc-walkthrough';


@NgModule({
    declarations: [TranscriptAnnotationComponent],
    exports: [
        TranscriptAnnotationComponent
    ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MatTooltipModule,
    FontAwesomeModule,
    BdcWalkModule
  ]
})
export class TranscriptAnnotation { }
