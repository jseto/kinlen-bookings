import { DatabaseObject } from "../database/database-object";
import { Utils } from "../utils/utils";

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
