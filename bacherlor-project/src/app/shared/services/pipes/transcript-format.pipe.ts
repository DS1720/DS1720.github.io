import {Pipe, PipeTransform} from '@angular/core';
import {StudentError} from '../../Entities/student-error';
import {split} from 'ts-node';

@Pipe({
  name: 'transcriptFormat'
})
export class TranscriptFormatPipe implements PipeTransform {

  /**
   * insert spans into transcript with existing error tags
   * @param transcript that should be processed
   */
  transform(transcript: string): string {
    // get all errors
    const errors = StudentError.getErrorsFromString(transcript);
    // get spans
    const spans = this.getSpans(errors);
    // insert start and end spans separately with span type and side as class
    for (const span of spans) {
      if (span.start === true) {
        transcript = this.insertIntoText(transcript, `<span class="${span.type} ${span.side} tooltip">`, span.index);
      } else {
        transcript = this.insertIntoText(transcript, `</span>`, span.index);
      }
    }
    return transcript;
  }

  /**
   * insert string into exisiting string
   * @param originalText where a string is inserted
   * @param insertedText string that is inserted
   * @param index where insertedText is inserted
   * @return processed string
   */
  insertIntoText(originalText: string, insertedText: string, index: number): string {
    return [originalText.slice(0, index), insertedText, originalText.slice(index)].join('');
  }

  /**
   * returns spans in order from back to front
   * @param errors made in the text
   */
  getSpans(errors: StudentError[]): { index: number, type?: string, id: number, start: boolean, side: string }[] {
    const spans: {index: number, type?: string, id: number, start: boolean, side: string}[] = [];
    // insert a span for every word in error
    for (const studentError of errors) {
      const originalText = studentError.getText();
      const text = originalText.substr(studentError.getOffsetFront(),
        originalText.length - studentError.getOffsetFront() - studentError.getOffsetBack());
      // get start index of text in error
      let currentIndex = studentError.getStartIndex() + studentError.getOffsetFront();
      // split text fragments from errorTags
      // splittedText only contains words or errorTags separately
      const splittedText = text.split('<');
      for (let i = 0; i < splittedText.length; i++) {
        const tempFragments = (splittedText[i]).split('>');
        if (tempFragments.length === 2) {
          tempFragments[0] = '<' + tempFragments[0] + '>';
          splittedText.splice(i, 1, tempFragments[0], tempFragments[1]);
          i++;
        }
      }
      // split every word that is not errorTag without losing spaces
      for (let i = 0; i < splittedText.length; i++) {
        if (splittedText[i].search('<') === -1) {
          const tempFragments = (splittedText[i]).split(' ');
          // join first and/or last whitespace
          if (tempFragments[0] === '') {
            tempFragments.splice(0, 1);
            tempFragments[0] = ' ' + tempFragments[0];
          }
          if (tempFragments[tempFragments.length - 1] === '') {
            tempFragments.splice(tempFragments.length - 1, 1);
            tempFragments[tempFragments.length - 1] += ' ';
          }
          if (tempFragments.length > 1) {
            // remove item and fill with fragment
            splittedText.splice(i, 1);
            let wordsInserted = 0;
            tempFragments.forEach(fragment => {
              if (fragment !== tempFragments[tempFragments.length - 1]) {
                // add removed white space because of splitting
                fragment += ' ';
              }
              splittedText.splice(i + wordsInserted, 0, fragment);
              wordsInserted++;
            });
            i += tempFragments.length - 1;
          }
        }
      }
      const spansErrorStart: { index: number, type?: string, id: number, start: boolean, side: string }[] = [];
      const spansErrorEnd: { index: number, type?: string, id: number, start: boolean, side: string }[] = [];
      for (const originalTextFragment of splittedText) {
        // Start Tag
        const regexStart = /<error id="\d*" type="\w*"\/>/;
        const regexEnd = /<error id="\d*"\/>/;
        const isStartTag = originalTextFragment.search(regexStart) !== -1;
        const isEndTag = originalTextFragment.search(regexEnd) !== -1;
        // only insert if fragment is no start or end Tag and is not Empty
        if (!(isStartTag || isEndTag) && originalTextFragment !== '') {
          spansErrorStart.push({
            index: currentIndex,
            type: studentError.getType(),
            id: studentError.getId(),
            start: true,
            side: ''
          });
          spansErrorEnd.push({
            index: currentIndex + originalTextFragment.length,
            type: studentError.getType(),
            id: studentError.getId(),
            start: false,
            side: ''
          });
        }
        //add processed Text to current Index
        currentIndex += originalTextFragment.length;
      }
      // if only one word was processed add left and right border
      if (spansErrorStart.length === 1) {
        spansErrorStart[0].side = 'left right';
      } else if (spansErrorStart.length > 0) { // if more than one word was processed
        spansErrorStart[0].side = 'left'; // add left border for first word
        spansErrorStart[spansErrorStart.length - 1].side = 'right'; // add right border for last word
      }
      spansErrorStart.forEach(span => spans.push(span));
      spansErrorEnd.forEach(span => spans.push(span));
    }
    // sort spans that they are returned backwards
    spans.sort((a, b) => {
      if (a.index > b.index) {
        return -1;
      } else {
        if (a.index < b.index) {
          return 1;
        } else {
          if (a.start && !b.start) {
            return -1;
          } else if (!a.start && b.start) {
            return 1;
          } else {
            return 0;
          }
        }
      }
      return  a.index > b.index ? -1 : a.index < b.index ? 1 : 0;
    });
    return spans;

  }
}
