
export abstract class DatabaseObject {
  protected _id: number;
  constructor( id: number ) {
    this._id = id;
  }

  abstract clone( p: any );

  protected get id() {
    return this._id;
  }
}
