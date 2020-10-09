import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transcriptFormat'
})
export class TranscriptFormatPipe implements PipeTransform {

  transform(text: string): string {
    let inTag = false;
    for (let index = text.length; index < text.length; index++) {
      if (text[index] === '<') {
        inTag = true;
      } else if (text[index] === '>') {
        inTag = false;
      }
      if (inTag) {

      }
    }
    return text;
  }

}
