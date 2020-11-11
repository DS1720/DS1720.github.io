import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { TranscriptAnnotation } from './components/transcript-annotation/transcript-annotation.module';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { AnnotationItemComponent } from './components/annotation-item/annotation-item.component';
import {FormsModule} from '@angular/forms';
import {BdcWalkModule} from 'bdc-walkthrough';
import { NgbTooltipModule, NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastGlobalComponent } from './components/toast-global/toast-global.component';

@NgModule({
  declarations: [
    AppComponent,
    FeedbackComponent,
    AnnotationItemComponent,
    ToastGlobalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    TranscriptAnnotation,
    FontAwesomeModule,
    FormsModule,
    BdcWalkModule,
    NgbTooltipModule,
    NgbToastModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
