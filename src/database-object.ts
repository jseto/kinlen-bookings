
export abstract class DatabaseObject {
    protected _id: number;

  constructor( id: number ) {
    this._id = id;
  }

	get id() {
		return this._id;
	}

  abstract fromObject( p: any );
  abstract toObject();
}
