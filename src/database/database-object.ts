
export abstract class DatabaseObject {
    protected _id: number;
		private _token: string;

  constructor( id: number ) {
    this._id = id;
  }

	setId( id: number ) {
		this._id = id;
	}

	get id() {
		return this._id;
	}

	get token() {
		return this._token;
	}

	fromObject( p: any ) {
		if ( p.id ) this._id = Number( p.id );
		if ( p.token ) this._token = p.token;

		this._fromObject( p );
	}

	toObject() {
		let obj = this._toObject();
		obj.id = this._id;
		obj.token = this._token;

		return obj;
	}

  protected abstract _fromObject( p: any ): void;
  protected abstract _toObject(): any;
}
