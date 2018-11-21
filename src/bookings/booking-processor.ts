import { Booking } from "../../src/bookings/booking";
import { BookingMapper } from "../../src/bookings/booking-mapper";
import { Restaurant } from "./restaurant";
import { Rest } from "../database/rest";
import { Coupon } from "./coupon";

export interface BookingData {
	restautantId: number,
	date: Date,
	time: string,
	adults: number,
	children: number,
	name: string,
	email: string,
	coupon: string,
	comments: string
}

export class BookingProcessor {
	private _restaurant: Restaurant;
	private _coupon: Coupon;
	private _booking: Booking;

	constructor( bookingData: BookingData ) {
		this._booking = new Booking(-1);
		this._booking.fromObject( bookingData );
	}

	async prepareBooking() {
		let restaurant = await this.restautant();
		let coupon = await this.coupon();
		let beforeDiscount = await this.beforeDiscount();
		this._booking.setRestaurant( restaurant.id );
		this._booking.setCouponValue( coupon.discount( beforeDiscount ) );
		this._booking.setAdultPrice( restaurant.adultPrice );
		this._booking.setChildrenPrice( restaurant.childrenPrice );
		return this._booking;
	}

	async totalToPay(): Promise<number> {
		let coupon = await this.coupon();
		let beforeDiscount = await this.beforeDiscount();
		return beforeDiscount - coupon.discount( beforeDiscount );
	}

	async beforeDiscount(): Promise<number> {
		let restautant = await this.restautant();
		let adultTotal = restautant.adultPrice * this._booking.adults;
		let childrenTotal = restautant.childrenPrice * this._booking.children;
		return adultTotal + childrenTotal;
	}

	async validCoupon() {
		let c = await this.coupon();
		return c.isValid();
	}

	async validateBooking(): Promise< boolean > {
		let mapper = new BookingMapper( this._booking.restautant );
		return await mapper.isTimeSlotAvailable( this._booking.date, this._booking.time, this.bookedSeats() )
	}

	async validatePayment(): Promise<boolean> {
		throw new Error("Method not implemented.");
  }

	async bookingInserted(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

	async process():Promise<boolean> {
		let valid: boolean = await this.validateBooking()
								&& await this.validCoupon()
								&& await this.validatePayment()
								&& await this.bookingInserted();

		return new Promise<boolean>((resolve)=> resolve( valid ) );
	}

	private bookedSeats() {
		return this._booking.adults + this._booking.children;
	}

	private async restautant(): Promise< Restaurant > {
		if( !this._restaurant ) {
			this._restaurant = await this.getRestaurant( this._booking.restautant );
		}
		return this._restaurant;
	}

	private async coupon(): Promise< Coupon > {
		if( !this._coupon ) {
			this._coupon = await this.getCoupon( this._booking.coupon );
		}
		return this._coupon;
	}

	private async getRestaurant(restautantId: number): Promise< Restaurant > {
		return new Promise< Restaurant >( ( resolve ) => {
			Rest.getREST( 'restaurant/', {id: restautantId } ).then( ( data ) => {
				let restaurant = new Restaurant(-1);
				restaurant.fromObject( data[0] );
				resolve( restaurant );
			})
		});
	}

	private async getCoupon( code: string ): Promise< Coupon > {
		return new Promise< Coupon >( ( resolve ) => {
			Rest.getREST( 'coupon/', { code: code } ).then( ( data ) => {
				let coupon = new Coupon(-1);
				coupon.fromObject( data[0] );
				resolve( coupon );
			})
		});
	}

}
