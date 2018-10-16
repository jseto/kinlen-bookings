import {DatabaseObject} from "./database-object";

export const MAX_SEATS_PER_GUIDE = 6;

export class Guide extends DatabaseObject{
  private _name: string;
  private _score: string;
  private _email: string;
  private _phone: string;
  private _lineId: string;
  private _paypal: string;

  maxSeats(): number {
    return MAX_SEATS_PER_GUIDE;
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
