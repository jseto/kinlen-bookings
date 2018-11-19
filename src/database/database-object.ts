
export abstract class DatabaseObject {
    protected _id: number;

  constructor( id: number ) {
    this._id = id;
  }

	get id() {
		return this._id;
	}

	fromObject( p: any ) {
		if ( p.id ) {
			this._id = Number( p.id );
			this._fromObject( p );
		}23
	}

	toObject() {
		let obj = this._toObject();
		obj.id = this._id;
		return obj;
	}

  abstract _fromObject( p: any );
  abstract _toObject();
}
