import {Pipe, PipeTransform} from '@angular/core';
import {StudentError} from '../../Entities/student-error';

@Pipe({
  name: 'transcriptFormat'
})
export class TranscriptFormatPipe implements PipeTransform {

  transform(text: string): string {
    const errors = StudentError.getErrorsFromString(text);
    const spans = this.getSpans(errors);
    for (const span of spans) {
      if (span.start === true) {
        text = this.insertIntoText(text, `<span class="${span.type} tooltip">`, span.index);
      } else {
        text = this.insertIntoText(text, `</span>`, span.index);
      }
    }
    return text;
  }

  insertIntoText(originalText: string, insertedText: string, index: number): string {
    return [originalText.slice(0, index), insertedText, originalText.slice(index)].join('');
  }

  /**
   * returns spans in order from back to front
   * @param errors made in the text
   */
  getSpans(errors: StudentError[]): { index: number, type?: string, id: number, start: boolean }[] {
    const spans: {index: number, type?: string, id: number, start: boolean}[] = [];
    for (const studentError of errors) {
      spans.push({index: studentError.getStartIndex(), type: studentError.getType(), id: studentError.getId(), start: true});
      spans.push({index: studentError.getEndIndex(), type: studentError.getType(), id: studentError.getId(), start: false});
    }
    spans.sort((a, b) => a.index > b.index ? -1 : a.index < b.index ? 1 : 0);
    let openSpans: {index: number, type?: string, id: number}[] = [];
    for (let i = 0; i < spans.length; i++) {
      let addedElements = 0;
      const currentSpan = spans[i];
      if (currentSpan.start === false) {
        if (openSpans.length > 0) {
          for (let j = openSpans.length - 1; j >= 0; j--) {
            const tempSpan = openSpans[j];
            spans.splice(i, 0, {index: currentSpan.index, type: tempSpan.type, id: tempSpan.id, start: false});
            addedElements++;
          }
          for (let j = openSpans.length - 1; j >= 0; j--) {
            const tempSpan = openSpans[j];
            spans.splice(i, 0, {index: currentSpan.index, type: tempSpan.type, id: tempSpan.id, start: true});
            addedElements++;
          }
        }
        openSpans.push(currentSpan);
      } else {
        openSpans = openSpans.filter(obj => {
          return obj.id !== currentSpan.id;
        });
        for (let j = openSpans.length - 1; j >= 0; j--) {
          const tempSpan = openSpans[j];
          spans.splice(i + 1, 0, {index: currentSpan.index, type: tempSpan.type, id: tempSpan.id, start: false});
          addedElements++;
        }
        for (let j = openSpans.length - 1; j >= 0; j--) {
          const tempSpan = openSpans[j];
          spans.splice(i, 0, {index: currentSpan.index, type: tempSpan.type, id: tempSpan.id, start: true});
          addedElements++;
        }
      }
      i += addedElements;
    }
    return spans;

  }
}
