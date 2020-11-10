import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WebSpeechComponent } from './web-speech/web-speech.component';
import {FeedbackComponent} from './feedback/feedback.component';


const routes: Routes = [
  { path: 'exam', component: WebSpeechComponent, pathMatch: 'full' },
  { path: 'feedback', component: FeedbackComponent, pathMatch: 'full'},
  { path: '', redirectTo: 'exam', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
