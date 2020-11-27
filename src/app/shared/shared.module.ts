import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranscriptFormatPipe } from './services/pipes/transcript-format.pipe';
import { CapitalizePipe } from './services/pipes/capitalize.pipe';

@NgModule({
  declarations: [TranscriptFormatPipe, CapitalizePipe],
  imports: [
    CommonModule,
  ],
  exports: [
    TranscriptFormatPipe,
    CapitalizePipe
  ]
})
export class SharedModule { }
