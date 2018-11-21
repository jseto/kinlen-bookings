import { DatabaseObject } from "../database/database-object";
import { Utils } from "../utils/utils";

export class Holiday extends DatabaseObject{
  private _date: Date;

	protected _toObject() {
		return {
			id: this._id,
			date: Utils.dateToString( this._date )
		}
	}

	protected _fromObject( obj: any ) {
			this._date = new Date( obj.date );
	}

	get date(): Date {
		return this._date;
	}

	set date( date: Date ) {
		this._date = date;
	}
}
