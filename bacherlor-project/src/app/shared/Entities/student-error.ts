export class StudentError {
  static getNewId(errorArray: StudentError[]): number {
    let highestId = -1;
    for (const error of errorArray) {
      if (error.getId() > highestId) {
        highestId = error.getId();
      }
    }
    return highestId + 1;
  }
  static getErrorsFromString(text: string): StudentError[] {
    const errors = [];
    let regex = /<error id="\d*" type="\w*"\/>/;
    let tempIndex = text.search(regex);
    let offset = 0;
    while (tempIndex !== -1) {
      const beginIndex = offset + tempIndex;
      const endIndex = offset + tempIndex + text.substr(offset + tempIndex).search('>');
      offset = offset + tempIndex + 1;
      tempIndex = text.substr(offset).search(regex);
      errors.push(this.getErrorFromString(text.substr(beginIndex, endIndex - beginIndex + 1), beginIndex));
    }
    regex = /<error id="\d*"\/>/;
    offset = 0;
    tempIndex = text.search(regex);
    while (tempIndex !== -1) {
      const beginIndex = offset + tempIndex;
      const length = text.substr(offset + tempIndex).search('>');
      offset = offset + tempIndex + 1;
      tempIndex = text.substr(offset).search(regex);
      const tempId = this.getIdFromString(text.substr(beginIndex, length));
      const tempError = errors.filter(x => x.getId() === tempId)[0];
      if (tempError) {
        tempError.setEndIndex(beginIndex + length + 1);
        tempError.setText(text.substr(tempError.getStartIndex(), tempError.getEndIndex() - tempError.getStartIndex()));
        tempError.setOffsetBack(tempError.getText().length - tempError.getText().lastIndexOf('<'));
      }
    }
    return errors;
  }

  static getIdFromString(text: string): number {
    const startIndexId = text.search('id="') + 4;
    const idLength = text.substr(startIndexId).search('"');
    return +text.substr(startIndexId, idLength);
  }

  static getErrorFromString(text: string, startIndex: number): StudentError {
    const id = this.getIdFromString(text);
    const startIndexType = text.search('type="') + 6;
    const typeLength = text.substr(startIndexType).search('"');
    const type = text.substr(startIndexType, typeLength);
    console.log(text);
    return new StudentError(id, type, startIndex, -1, '', text.length, -1);
  }

  constructor(private id: number, private type: string, private startIndex: number, private endIndex: number, private text: string, private offsetFront: number, private offsetBack: number) {
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
