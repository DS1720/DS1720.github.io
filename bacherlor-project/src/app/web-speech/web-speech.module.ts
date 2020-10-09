import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSpeechComponent } from './web-speech.component';
import { MaterialModule } from '../shared/material/material.module';
import {SharedModule} from '../shared/shared.module';


@NgModule({
    declarations: [WebSpeechComponent],
    exports: [
        WebSpeechComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        SharedModule
    ]
})
export class WebSpeechModule { }
