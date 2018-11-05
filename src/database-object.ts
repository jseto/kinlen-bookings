import { Utils } from "./utils";

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


export class Holiday extends DatabaseObject{
  private _date: string;

	toObject() {
		return {
			id: this._id,
			date: this._date
		}
	}

	fromObject( obj: any ) {
		if ( obj.id ) {
			this._id = Number(obj.id);
			this._date = obj.date;
		}
	}

	get date() {
		return this._date;
	}

	set date( date: string ) {
		Utils.checkValidDate( date );
		this._date = date;
	}
}
