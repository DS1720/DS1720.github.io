export class Annotation {
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
    const errors = [];
    let regex = /<error id="\d*" type="\w*"\/>/;
    let tempIndex = text.search(regex);
    let offset = 0;
    // search for all start tags of errors
    while (tempIndex !== -1) {
      // calculate start and end index of error starting tag
      const beginIndex = offset + tempIndex;
      const endIndex = offset + tempIndex + text.substr(offset + tempIndex).search('>');
      offset = offset + tempIndex + 1;
      tempIndex = text.substr(offset).search(regex);
      // push found error
      errors.push(this.getAnnotationFromString(text.substr(beginIndex, endIndex - beginIndex + 1), beginIndex));
    }
    regex = /<error id="\d*"\/>/;
    offset = 0;
    tempIndex = text.search(regex);
    // find all ending tags of errors
    while (tempIndex !== -1) {
      // calculate end index of error
      const beginIndex = offset + tempIndex;
      const length = text.substr(offset + tempIndex).search('>');
      offset = offset + tempIndex + 1;
      tempIndex = text.substr(offset).search(regex);
      const tempId = this.getIdFromString(text.substr(beginIndex, length));
      // find error with id of end tag
      const tempError = errors.filter(x => x.getId() === tempId)[0];
      if (tempError) {
        // set end index, text, and back offset of error
        tempError.setEndIndex(beginIndex + length + 1);
        tempError.setText(text.substr(tempError.getStartIndex(), tempError.getEndIndex() - tempError.getStartIndex()));
        tempError.setOffsetBack(tempError.getText().length - tempError.getText().lastIndexOf('<'));
      }
    }
    return errors;
  }

  /**
   * returns the id from an error tag
   * @param text of error tag
   */
  private static getIdFromString(text: string): number {
    const startIndexId = text.search('id="') + 4;
    const idLength = text.substr(startIndexId).search('"');
    return +text.substr(startIndexId, idLength);
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
    const typeLength = text.substr(startIndexType).search('"');
    const type = text.substr(startIndexType, typeLength);
    return new Annotation(id, type, startIndex, -1, '', text.length, -1);
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
    private offsetBack: number
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
}
