export class Annotation {

  static regexStartTag = /<annotation id="\d*" type="\w*" positive="\w*"\/>/;
  static regexEndTag = /<annotation id="\d*"\/>/;

  /**
   * returns new annotationId
   * @param annotationArray of already existing annotations
   */
  static getNewId(annotationArray: Annotation[]): number {
    let highestId = -1;
    for (const annotation of annotationArray) {
      if (annotation.getId() > highestId) {
        highestId = annotation.getId();
      }
    }
    return highestId + 1;
  }

  /**
   * returns Annotations from String
   * annotations have to first have a starting tag and then an ending tag
   * @param text with inserted Annotations
   */
  static getAnnotationsFromString(text: string): Annotation[] {
    const annotations = [];
    let regex = this.regexStartTag;
    let tempIndex = text.search(regex);
    let offset = 0;
    // search for all start tags of annotations
    while (tempIndex !== -1) {
      // calculate start and end index of annotation starting tag
      const beginIndex = offset + tempIndex;
      const endIndex = offset + tempIndex + text.substr(offset + tempIndex).search('>');
      offset = offset + tempIndex + 1;
      tempIndex = text.substr(offset).search(regex);
      // push found annotation
      annotations.push(this.getAnnotationFromString(text.substr(beginIndex, endIndex - beginIndex + 1), beginIndex));
    }
    regex = this.regexEndTag;
    offset = 0;
    tempIndex = text.search(regex);
    // find all ending tags of annotations
    while (tempIndex !== -1) {
      // calculate end index of annotation
      const beginIndex = offset + tempIndex;
      const length = text.substr(offset + tempIndex).search('>');
      offset = offset + tempIndex + 1;
      tempIndex = text.substr(offset).search(regex);
      const tempId = this.getIdFromString(text.substr(beginIndex, length));
      // find annotation with id of end tag
      const tempAnnotation = annotations.filter(x => x.getId() === tempId)[0];
      if (tempAnnotation) {
        // set end index, text, and back offset of annotation
        tempAnnotation.setEndIndex(beginIndex + length + 1);
        tempAnnotation.setText(text.substr(tempAnnotation.getStartIndex(), tempAnnotation.getEndIndex() - tempAnnotation.getStartIndex()));
        tempAnnotation.setOffsetBack(tempAnnotation.getText().length - tempAnnotation.getText().lastIndexOf('<'));
      } else {
        // get offset Back
        annotations.push(new Annotation(tempId, '', -1, beginIndex + length + 1, '', -1, length, false));
      }
    }
    return annotations;
  }

  /**
   * returns the id from an annotation tag
   * @param text of annotation tag
   */
  private static getIdFromString(text: string): number {
    const startIndexId = text.search('id="') + 4;
    if (startIndexId !== -1) {
      const idLength = text.substr(startIndexId).search('"');
      return +text.substr(startIndexId, idLength);
    }
    return -1;
  }

  /**
   * return an annotation from a start tag
   * fills start index and type, endIndex -1, text '', offsetBack -1
   * @param text of annotation
   * @param startIndex of created annotation
   */
  private static getAnnotationFromString(text: string, startIndex: number): Annotation {
    const id = this.getIdFromString(text);
    const startIndexType = text.search('type="') + 6;
    let type = '';
    if (startIndexType !== -1) {
      const typeLength = text.substr(startIndexType).search('"');
      type = text.substr(startIndexType, typeLength);
    }
    const positiveIndex = text.search('positive="') + 10;
    let positiveString = '';
    if (positiveIndex !== -1) {
      const positiveLength = text.substr(positiveIndex).search('"');
      positiveString = text.substr(positiveIndex, positiveLength);
    }
    let positive = true;
    if (positiveString === 'false') {
      positive = false;
    }
    return new Annotation(id, type, startIndex, -1, '', text.length, -1, positive);
  }

  /**
   * get all Tags from String
   */
  static getAllTagsFromString(text: string): {id: number, start: boolean, type: string, positive: boolean}[] {
    const tags: {id: number, start: boolean, type: string, positive: boolean}[] = [];
    let tempStartIndex = text.search(this.regexStartTag);
    // get start tags
    let tempText = text;
    while (tempStartIndex !== -1) {
      tempText = tempText.substr(tempStartIndex);
      const length = tempText.search('>');
      const annotation = this.getAnnotationFromString(tempText.substr(0, length), 0);
      tempText = tempText.substr(length + 1);
      tags.push({id: annotation.id, start: true, type: annotation.type, positive: annotation.positive});
      tempStartIndex = tempText.search(this.regexStartTag);
    }
    // get end tags
    tempText = text;
    tempStartIndex = tempText.search(this.regexEndTag);
    while (tempStartIndex !== -1) {
      tempText = tempText.substr(tempStartIndex);
      const length = tempText.search('>');
      const annotation = this.getAnnotationFromString(tempText.substr(0, length + 1), 0);
      tempText = tempText.substr(length + 1);
      tags.push({id: annotation.id, start: false, type: '', positive: false});
      tempStartIndex = tempText.search(this.regexEndTag);
    }
    return tags;
  }

  /**
   * deletes all annotations from text with other id than id
   * @param id of annotation that should not be deleted
   * @param text to edit
   */
  static deleteTagsFromOtherAnnotations(id: number, text: string): string {
    const startTagRegex = '<annotation id="((?!' + id + ').)*" type="\\w*" positive="\\w*"\\/>';
    let startIndex = text.search(startTagRegex);
    // as long as there are foreign tags
    while (startIndex !== -1) {
      // search for end index
      let tempEnd = startIndex;
      while (text[tempEnd] !== '>') {
        tempEnd++;
      }
      tempEnd++;
      // delete tag
      text = this.deleteFromText(startIndex, tempEnd, text);
      startIndex = text.search(startTagRegex);
    }
    const endTagRegex = '<annotation id="((?!' + id + ').)*"\\/>';
    startIndex = text.search(endTagRegex);
    while (startIndex !== -1) {
      // search for end index
      let tempEnd = startIndex;
      while (text[tempEnd] !== '>') {
        tempEnd++;
      }
      tempEnd++;
      // delete tag
      text = this.deleteFromText(startIndex, tempEnd, text);
      startIndex = text.search(startTagRegex);
    }
    return text;
  }

  /**
   * deletes from text
   * @param startIndex of first letter deleted
   * @param endIndex of last letter deleted
   */
  private static deleteFromText(startIndex: number, endIndex: number, text: string): string {
    return text.substr(0, startIndex) +
      text.substr(endIndex);
  }

  /**
   * constructor of Annotation
   * @param id of Annotation
   * @param type of Annotation
   * @param startIndex of Annotation
   * @param endIndex of Annotation
   * @param text of Annotation
   * @param offsetFront is length of front tag
   * @param offsetBack is length of end tag
   */
  constructor(
    private id: number,
    private type: string,
    private startIndex: number,
    private endIndex: number,
    private text: string,
    private offsetFront: number,
    private offsetBack: number,
    private positive: boolean
  ) {
  }
  getId(): number {
    return this.id;
  }
  getEndIndex(): number {
    return this.endIndex;
  }
  getStartIndex(): number {
    return this.startIndex;
  }
  getType(): string {
    return this.type;
  }
  setEndIndex(index: number): void {
    this.endIndex = index;
  }
  setText(text: string): void {
    this.text = text;
  }
  getText(): string {
    return this.text;
  }
  getOffsetFront(): number {
    return this.offsetFront;
  }
  getOffsetBack(): number {
    return this.offsetBack;
  }
  setOffsetBack(offsetBack: number): void {
    this.offsetBack = offsetBack;
  }
  getPositive(): boolean {
    return this.positive;
  }
  setPositive(positive: boolean): void {
    this.positive = positive;
  }
}
