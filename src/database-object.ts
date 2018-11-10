import { Utils } from "./utils";

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
		}
	}

	toObject() {
		let obj = this._toObject();
		obj.id = this._id;
		return obj;
	}

  abstract _fromObject( p: any );
  abstract _toObject();
}


export class Holiday extends DatabaseObject{
  private _date: string;

	_toObject() {
		return {
			id: this._id,
			date: this._date
		}
	}

	_fromObject( obj: any ) {
			this._date = obj.date;
	}

	get date() {
		return this._date;
	}

	set date( date: string ) {
		Utils.checkValidDate( date );
		this._date = date;
	}
}
