import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranscriptFormatPipe } from './services/pipes/transcript-format.pipe';

@NgModule({
  declarations: [TranscriptFormatPipe],
  imports: [
    CommonModule,
  ],
    exports: [
        TranscriptFormatPipe
    ]
})
export class SharedModule { }
