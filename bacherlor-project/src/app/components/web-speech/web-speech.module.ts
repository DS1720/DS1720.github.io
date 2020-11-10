import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSpeechComponent } from './web-speech.component';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule} from '@angular/forms';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';


@NgModule({
    declarations: [WebSpeechComponent],
    exports: [
        WebSpeechComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        MatTooltipModule,
        FontAwesomeModule
    ]
})
export class WebSpeechModule { }
