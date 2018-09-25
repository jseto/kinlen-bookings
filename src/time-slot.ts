
export class TimeSlot {
    private _startTime: string;
    private _length: number; // duration in seconds

    constructor( startTime: string, length: number ) {
      this._startTime = startTime;
      this._length = length;
    }

    getStart() {
      return this._startTime;
    }

    getLenght() {
      return this._length;
    }
}
