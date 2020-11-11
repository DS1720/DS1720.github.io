import {Pipe, PipeTransform} from '@angular/core';
import {Annotation} from '../../Entities/annotation';
import {split} from 'ts-node';

@Pipe({
  name: 'transcriptFormat'
})
export class TranscriptFormatPipe implements PipeTransform {

  /**
   * insert spans into transcript with existing annotation tags
   * @param transcript that should be processed
   */
  transform(transcript: string): string {
    // get all annotations
    const annotations = Annotation.getAnnotationsFromString(transcript);
    // get spans
    const spans = this.getSpans(annotations);
    // insert start and end spans separately with span type and side as class
    for (const span of spans) {
      const positive = span.positive ? 'positive' : '';
      if (span.start === true) {
        transcript = this.insertIntoText(transcript, `<span class="${span.type} ${span.side} ${positive} tooltip">`, span.index);
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
  private insertIntoText(originalText: string, insertedText: string, index: number): string {
    return [originalText.slice(0, index), insertedText, originalText.slice(index)].join('');
  }

  /**
   * returns spans in order from back to front
   * @param annotations made in the text
   */
  private getSpans(annotations: Annotation[]): { index: number, type?: string, id: number, start: boolean, side: string, positive: boolean }[] {
    const spans: {index: number, type?: string, id: number, start: boolean, side: string, positive: boolean}[] = [];
    // insert a span for every word in annotation
    for (const studentAnnotation of annotations) {
      const originalText = studentAnnotation.getText();
      const text = originalText.substr(studentAnnotation.getOffsetFront(),
        originalText.length - studentAnnotation.getOffsetFront() - studentAnnotation.getOffsetBack());
      // get start index of text in annotation
      let currentIndex = studentAnnotation.getStartIndex() + studentAnnotation.getOffsetFront();
      // split text fragments from annotationTags
      // splittedText only contains words or annotationTags separately
      const splittedText = text.split('<');
      for (let i = 0; i < splittedText.length; i++) {
        const tempFragments = (splittedText[i]).split('>');
        if (tempFragments.length === 2) {
          tempFragments[0] = '<' + tempFragments[0] + '>';
          splittedText.splice(i, 1, tempFragments[0], tempFragments[1]);
          i++;
        }
      }
      // split every word that is not annotationTag without losing spaces
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
      const spansAnnotationStart: { index: number, type?: string, id: number, start: boolean, side: string, positive: boolean }[] = [];
      const spansAnnotationEnd: { index: number, type?: string, id: number, start: boolean, side: string, positive: boolean }[] = [];
      for (const originalTextFragment of splittedText) {
        // Start Tag
        const regexStart = /<annotation id="\d*" type="\w*"\/>/;
        const regexEnd = /<annotation id="\d*"\/>/;
        const isStartTag = originalTextFragment.search(regexStart) !== -1;
        const isEndTag = originalTextFragment.search(regexEnd) !== -1;
        // only insert if fragment is no start or end Tag and is not Empty
        if (!(isStartTag || isEndTag) && originalTextFragment !== '') {
          spansAnnotationStart.push({
            index: currentIndex,
            type: studentAnnotation.getType(),
            id: studentAnnotation.getId(),
            start: true,
            side: '',
            positive: studentAnnotation.getPositive()
          });
          spansAnnotationEnd.push({
            index: currentIndex + originalTextFragment.length,
            type: studentAnnotation.getType(),
            id: studentAnnotation.getId(),
            start: false,
            side: '',
            positive: studentAnnotation.getPositive()
          });
        }
        // add processed Text to current Index
        currentIndex += originalTextFragment.length;
      }
      // if only one word was processed add left and right border
      if (spansAnnotationStart.length === 1) {
        spansAnnotationStart[0].side = 'left right';
      } else if (spansAnnotationStart.length > 0) { // if more than one word was processed
        spansAnnotationStart[0].side = 'left'; // add left border for first word
        spansAnnotationStart[spansAnnotationStart.length - 1].side = 'right'; // add right border for last word
      }
      spansAnnotationStart.forEach(span => spans.push(span));
      spansAnnotationEnd.forEach(span => spans.push(span));
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
