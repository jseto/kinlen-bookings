import {DatabaseObject} from "../database/database-object";
import { Utils } from "../utils/utils";

export const MAX_SEATS_PER_GUIDE = 6;

export class Guide extends DatabaseObject{
  private _name: string;
  private _score: string;
  private _email: string;
  private _phone: string;
  private _lineId: string;
  private _paypal: string;

  maxSeats(): number {
		if ( this._id >=0 ) {
    	return MAX_SEATS_PER_GUIDE;
		}
		else {
			return 0;
		}
  };

  protected _toObject(){
    return {
			name: this._name,
			score: this._score,
			phone: this._phone,
			email: this._email,
			lineId: this._lineId,
			paypal: this._paypal
    };
  }

  protected _fromObject( obj: any ) {
		this._name = obj.name;
		this._score = obj.score;
		this._phone = obj.phone;
		this._email = obj.email;
		this._lineId = obj.line_id;
		this._paypal = obj.paypal;
  }
}

export class FreeGuide extends Guide {
  private _date: Date;

	setDate( date: Date ) {
		this._date = date;
		return this;
	}

	get date(): Date {
		return this._date;
	}

	_toObject() {
		let obj:any = super._toObject();
		obj.date = Utils.dateToString( this._date );
		return obj;
	}

	_fromObject( obj: any ) {
		super._fromObject( obj );
		this._date = new Date( obj.date );
	}
}
