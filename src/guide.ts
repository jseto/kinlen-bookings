class GuideBase {
  maxOfferedSeats(): number{
    return 6;
  };
}

export class Guide extends GuideBase {
  private _id: number;

  constructor( id: number ) {
    super();
    this._id = id;
  }
}
