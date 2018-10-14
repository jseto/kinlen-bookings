import {DatabaseObject} from "./database-object";
import { Utils } from "./utils";

export const MAX_SEATS_PER_GUIDE = 6;

export class GuideHoliday extends DatabaseObject{
  private _date: string;

	toObject() {
		return {
			id: this._id,
			date: this._date
		}
	}

	fromObject( obj: any ) {
		this._id = Number(obj.id);
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

export class Guide extends DatabaseObject{
  private _name: string;
  private _score: string;
  private _email: string;
  private _phone: string;
  private _lineId: string;
  private _paypal: string;

  maxOfferedSeats(): number{
    return 6;
  };

  toObject(){
    return {
      id: this._id,
			name: this._name,
			score: this._score,
			phone: this._phone,
			email: this._email,
			lineId: this._lineId,
			paypal: this._paypal
    };
  }

  fromObject( obj: any ) {
		this._id = Number(obj.id);
		this._name = obj.name;
		this._score = obj.score;
		this._phone = obj.phone;
		this._email = obj.email;
		this._lineId = obj.line_id;
		this._paypal = obj.paypal;
  }
}
