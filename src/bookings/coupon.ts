import {DatabaseObject} from "../database/database-object";
import { Utils } from "../utils/utils";

export class Coupon extends DatabaseObject{
	private _code: string;
	private _validUntil: Date;
	private _value: number;
	private _valueType: string;
	private _commission: number;
	private _commisionistId: number;

	isValid(): boolean {
		if ( this.id < 0 ) return false;
		if ( Utils.isInvalid( this._validUntil ) ) return true;
		let today = Date.now();
		return Utils.forceUTC( this._validUntil, 17, 0 ) >= today;
	}

	discount( basePrice?: number ): number {
		if ( !this.isValid() ) return 0;
		if ( this._valueType !== 'percent' ) {
			return this._value;
		}
		else if ( basePrice === undefined ) {
			throw new Error('Error: To calculate absoluteValue of percent a base price as parameter should be passed');
		}
		return basePrice * this._value / 100;
	}

  _toObject(){
    return {
			code: this._code,
			validUntil: Utils.dateToString( this._validUntil ),
			value: this._value,
			valueType: this._valueType,
			commission: this._commission,
			commisionistId: this._commisionistId
    };
  }

  _fromObject( obj: any ) {
		this._code = obj.code;
		this._validUntil = new Date( obj.validUntil );
		this._value = obj.value;
		this._valueType = obj.valueType;
		this._commission = obj.commission;
		this._commisionistId = obj.commisionistId;
  }
}
