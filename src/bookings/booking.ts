import { DatabaseObject } from "../database/database-object"
import { Utils } from "../utils/utils";

export const BOOKABLE_TIMES = [ '19:00:00', '21:00:00' ];

export class Booking extends DatabaseObject {
  private _date: Date;
  private _time: string;
  private _timeLength: number;
	private _comment: string;
  private _restaurant: number;
  private _assignedGuide: number;
	private _adults: number;
	private _children: number;
	private _coupon: string;
	private _adultPrice: number;
	private _childrenPrice: number;
	private _couponValue: number;
	private _paidAmount: number;
	private _paid: boolean;
  private _name: string;
	private _email: string;
	private _paypalPaymentId: string;
	private _trasactionTimeStamp: Date;

  protected _fromObject( obj: any ){
    this._date = new Date( obj.date );
    this._time = obj.time;
    this._timeLength = Number( obj.time_length );
		this._comment = obj.comment;
    this._restaurant = Number( obj.restaurant_id );
    this._assignedGuide = Number( obj.guide_id );
		this._adults = Number( obj.adults );
		this._children = Number( obj.children );
		this._coupon = obj.coupon;
		this._adultPrice = Number( obj.adultPrice );
		this._childrenPrice = Number( obj.childrenPrice );
		this._couponValue = Number( obj.couponValue );
		this._paidAmount = Number( obj.paidAmount );
		this._paid = Boolean( obj.paid );
 		this._name = obj.name;
 		this._email = obj.email;
 		this._paypalPaymentId = obj.paypalPaymentId;
 		this._trasactionTimeStamp = new Date( obj.trasactionTimeStamp );
  }

  protected _toObject() {
    return{
      date: Utils.dateToString( this.date ),
      time: this.time,
      time_length: this.timeLength,
			comment: this.comment,
      restaurant_id: this.restaurant,
      guide_id: this.assignedGuide,
			adults: this.adults,
			children: this.children,
			coupon: this.coupon,
			adultPrice: this.adultPrice,
			childrenPrice: this.childrenPrice,
			couponValue: this.couponValue,
			paidAmount: this.paidAmount,
			paid: Number( this.paid ),
			name: this._name,
			email: this._email,
			paypalPaymentId: this._paypalPaymentId,
			trasactionTimeStamp: this._trasactionTimeStamp
		};
  }

  setDate( date: Date ) {
    this._date=date;
    return this;
  }

  get date(): Date {
    return this._date;
  }

  setTime( time: string ){
    this._time = time;
    return this;
  }

  get time() {
    return this._time;
  }

	setTimeLength( time: number ){
    this._timeLength = time;
    return this;
  }

  get timeLength() {
    return this._timeLength;
  }

	setComment( comment: string ){
    this._comment = comment;
    return this;
  }

  get comment() {
    return this._comment;
  }

  setRestaurant( id: number ) {
    this._restaurant = id;
    return this;
  }

  get restaurant() {
    return this._restaurant;
  }

  setAssignedGuide( id: number ) {
    this._assignedGuide = id;
    return this;
  }

  get assignedGuide() :number{
    return this._assignedGuide;
  }

  get bookedSeats() {
    return this.adults + this.children;
  }

	setAdults( val: number ) {
		this._adults = val;
		return this;
	}

	get adults() {
		return this._adults;
	}

	setChildren( val: number ) {
		this._children = val;
		return this;
	}

	get children() {
		return this._children;
	}

	setCoupon( val: string ) {
		this._coupon = val;
		return this;
	}

	get coupon() {
		return this._coupon;
	}

	setAdultPrice( val: number ) {
		this._adultPrice = val;
		return this;
	}

	get adultPrice() {
		return this._adultPrice;
	}

	setChildrenPrice( val: number ) {
		this._childrenPrice = val;
		return this;
	}

	get childrenPrice() {
		return this._childrenPrice;
	}

	setCouponValue( val: number ) {
		this._couponValue = val;
		return this;
	}

	get couponValue() {
		return this._couponValue;
	}

	setPaidAmount	( val: number ) {
		this._paidAmount = val;
		return this;
	}

	get paidAmount() {
		return this._paidAmount;
	}

	setPaid	( val: boolean ) {
		this._paid = val;
		return this;
	}

	get paid() {
		return this._paid;
	}

	setName( val: string ) {
		this._name = val;
		return this;
	}

	get name() {
		return this._name;
	}

	setEmail( val: string ) {
		this._email = val;
		return this;
	}

	get email() {
		return this._email;
	}

	setPaypalPaymentId( val: string ) {
		this._paypalPaymentId = val;
		return this;
	}

	get paypalPaymentId() {
		return this._paypalPaymentId;
	}

	setTrasactionTimeStamp( val: Date ) {
		this._trasactionTimeStamp = val;
		return this;
	}

	get trasactionTimeStamp() {
		return this._trasactionTimeStamp;
	}
}
