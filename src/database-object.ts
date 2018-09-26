
export abstract class DatabaseObject {
    protected _id: number;

  constructor( id: number ) {
    this._id = id;
  }

  abstract fromObject( p: any );
  abstract toObject();
}
