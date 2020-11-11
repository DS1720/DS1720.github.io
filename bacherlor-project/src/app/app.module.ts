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

@NgModule({
  declarations: [
    AppComponent,
    FeedbackComponent,
    AnnotationItemComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    TranscriptAnnotation,
    FontAwesomeModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
