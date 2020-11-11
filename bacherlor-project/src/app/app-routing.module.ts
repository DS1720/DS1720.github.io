import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TranscriptAnnotationComponent } from './components/transcript-annotation/transcript-annotation.component';
import {FeedbackComponent} from './components/feedback/feedback.component';


const routes: Routes = [
  { path: 'exam', component: TranscriptAnnotationComponent, pathMatch: 'full' },
  { path: 'feedback', component: FeedbackComponent, pathMatch: 'full'},
  { path: '', redirectTo: 'exam', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
