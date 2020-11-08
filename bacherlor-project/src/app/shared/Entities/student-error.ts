export class StudentError {
  /**
   * returns new errorId
   * @param errorArray of already existing errors
   */
  static getNewId(errorArray: StudentError[]): number {
    let highestId = -1;
    for (const error of errorArray) {
      if (error.getId() > highestId) {
        highestId = error.getId();
      }
    }
    return highestId + 1;
  }

  /**
   * returns Errors from String
   * errors have to first have a starting tag and then an ending tag
   * @param text with inserted Errors
   */
  static getErrorsFromString(text: string): StudentError[] {
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
      errors.push(this.getErrorFromString(text.substr(beginIndex, endIndex - beginIndex + 1), beginIndex));
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
  static getIdFromString(text: string): number {
    const startIndexId = text.search('id="') + 4;
    const idLength = text.substr(startIndexId).search('"');
    return +text.substr(startIndexId, idLength);
  }

  /**
   * return an error from a start tag
   * fills start index and type, endIndex -1, text '', offsetBack -1
   * @param text of error
   * @param startIndex of created error
   */
  static getErrorFromString(text: string, startIndex: number): StudentError {
    const id = this.getIdFromString(text);
    const startIndexType = text.search('type="') + 6;
    const typeLength = text.substr(startIndexType).search('"');
    const type = text.substr(startIndexType, typeLength);
    return new StudentError(id, type, startIndex, -1, '', text.length, -1);
  }

  /**
   * constructor of studenError
   * @param id of studentError
   * @param type of studentError
   * @param startIndex of studentError
   * @param endIndex of studentError
   * @param text of studentError
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
