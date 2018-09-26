
export abstract class DatabaseObject {
  protected _id: number;
  constructor( id: number ) {
    this._id = id;
  }

  abstract clone( p: any );

  getId() {
    return this._id;
  }
}
