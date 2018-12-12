
export abstract class DatabaseObject {
    protected _id: number;

  constructor( id: number ) {
    this._id = id;
  }

	setId( id: number ) {
		this._id = id;
	}

	get id() {
		return this._id;
	}

	fromObject( p: any ) {
		if ( p.id ) this._id = Number( p.id );
		this._fromObject( p );
	}

	toObject() {
		let obj = this._toObject();
		obj.id = this._id;
		return obj;
	}

  protected abstract _fromObject( p: any ): void;
  protected abstract _toObject(): any;
}
