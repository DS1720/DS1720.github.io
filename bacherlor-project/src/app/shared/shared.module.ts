import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { ModalHelpComponent } from './components/modal-help/modal-help.component';
import { TranscriptFormatPipe } from './services/pipes/transcript-format.pipe';

@NgModule({
  declarations: [ModalHelpComponent, TranscriptFormatPipe],
  imports: [
    CommonModule,
    MaterialModule
  ],
    exports: [
        MaterialModule,
        ModalHelpComponent,
        TranscriptFormatPipe
    ]
})
export class SharedModule { }
