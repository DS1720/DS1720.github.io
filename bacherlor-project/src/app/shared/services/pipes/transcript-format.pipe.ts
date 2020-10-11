import {Pipe, PipeTransform} from '@angular/core';
import {StudentError} from '../../Entities/student-error';

@Pipe({
  name: 'transcriptFormat'
})
export class TranscriptFormatPipe implements PipeTransform {

  transform(text: string): string {
    const errors = StudentError.getErrorsFromString(text);
    console.log(errors);
    const spans: {index: number, type?: string}[] = [];
    errors.sort((a, b) => a.getEndIndex() > b.getEndIndex() ? -1 : a.getEndIndex() < b.getEndIndex() ? 1 : 0);
    let tagOpen = false;
    let tempEndIndex = -1;
    let tempStartIndex = -1;
    let type = '';
    for (let index = 0; index < errors.length; index++) {
      const error = errors[index];
      if (index === errors.length - 1) { // end of array
        if (!tagOpen) { // no tag is open, save error
          spans.push({index: error.getEndIndex()});
          spans.push({index: error.getStartIndex(), type: error.getType()});
        } else { // tag is open, save general error
          spans.push({index: tempEndIndex});
          spans.push({index: error.getStartIndex(), type: 'generalError'});
        }
      } else {
        if (tagOpen) { // tag is open
          if (tempStartIndex > error.getEndIndex()) { // tags don't overlap
            spans.push({index: tempEndIndex});
            spans.push({index: tempStartIndex, type});
            type = error.getType(); // open new tag
            tempEndIndex = error.getEndIndex();
            tempStartIndex = error.getStartIndex();
          } else { // tags overlap
            tempStartIndex = error.getStartIndex();
            type = 'generalError';
          }
        } else { // no tag is open
          tagOpen = true;
          type = error.getType();
          tempEndIndex = error.getEndIndex();
          tempStartIndex = error.getStartIndex();
        }
      }
    }
    console.log(spans);
    for (const span of spans) {
      if (span.type) {
        text = this.insertIntoText(text, `<span class="${span.type}">`, span.index);
      } else {
        text = this.insertIntoText(text, `</span>`, span.index);
      }
      console.log(text);
    }
    return text;
  }

  insertIntoText(originalText: string, insertedText: string, index: number): string {
    return [originalText.slice(0, index), insertedText, originalText.slice(index)].join('');
  }

}
