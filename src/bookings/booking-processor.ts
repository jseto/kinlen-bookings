import { Booking } from "../../src/bookings/booking";
import { BookingMapper } from "../../src/bookings/booking-mapper";
import { Restaurant } from "./restaurant";
import { Rest } from "../database/rest";
import { Coupon } from "./coupon";
import { Utils } from "../utils/utils";
import { BookingError } from "../../test/bookings/BookingError";

export interface RawBooking {
	restaurant_id: number,
	date: Date,
	time: string,
	adults: number,
	children: number,
	name: string,
	email: string,
	coupon: string,
	comment: string
}

export class BookingProcessor {
	private _rawBooking: RawBooking;
  private _restaurant: Restaurant;
	private _coupon: Coupon;
	private _booking: Booking;

	constructor( booking: RawBooking ) {
		this._rawBooking = booking;
	}

	async booking() {
		if ( !this._booking ) {
			this._booking = new Booking( -1 );
			this._booking.fromObject( this._rawBooking );
			let restaurant = await this.restaurant();
			let coupon = await this.coupon();
			let beforeDiscount = await this.beforeDiscount();
			this._booking.setCouponValue( coupon.discount( beforeDiscount ) );
			this._booking.setAdultPrice( restaurant.adultPrice );
			this._booking.setChildrenPrice( restaurant.childrenPrice );
		}
		return this._booking;
	}

	async totalToPay(): Promise<number> {
		let coupon = await this.coupon();
		let beforeDiscount = await this.beforeDiscount();
		return beforeDiscount - coupon.discount( beforeDiscount );
	}

	async beforeDiscount(): Promise<number> {
		let restaurant = await this.restaurant();
		let adultTotal = restaurant.adultPrice * this._rawBooking.adults;
		let childrenTotal = restaurant.childrenPrice * this._rawBooking.children;
		return adultTotal + childrenTotal;
	}

	async isCouponValid() {
		if ( this._rawBooking.coupon === '' ) return true;
		let c = await this.coupon();
		return c.isValid();
	}

	async validateBooking( doThrow: boolean = false ): Promise< boolean > {
		if ( Utils.isInvalid( this._rawBooking.date ) ) {
			if (doThrow) throw new BookingError( 'INVALID_DATE' );
			return false;
		}

		let validCoupon = await this.isCouponValid();
		if ( !validCoupon ) {
			if (doThrow) throw new BookingError( 'INVALID_COUPON' );
			return false;
		}

		let mapper = new BookingMapper( this._rawBooking.restaurant_id );
		let available = await mapper.isTimeSlotAvailable( this._rawBooking.date, this._rawBooking.time, this.bookedSeats() );
		if ( !available && doThrow ) throw new BookingError( 'BOOKING_NOT_AVAILABLE' );
		return available;
	}

	async validatePayment( doThrow: boolean = false ): Promise<boolean> {
		return false;
  }

	async bookingInserted( doThrow: boolean = false ): Promise<boolean> {
    return false;
  }

	async process():Promise<boolean> {
		let valid: boolean = await this.validateBooking( true )
								&& await this.validatePayment( true )
								&& await this.bookingInserted( true );

		return valid;
	}

	private bookedSeats() {
		return this._rawBooking.adults + this._rawBooking.children;
	}

	async restaurant(): Promise< Restaurant > {
		if( !this._restaurant ) {
			this._restaurant = await BookingProcessor.getRestaurant( this._rawBooking.restaurant_id );
		}
		return this._restaurant;
	}

	private async coupon(): Promise< Coupon > {
		if( !this._coupon ) {
			this._coupon = await BookingProcessor.getCoupon( this._rawBooking.coupon );
		}
		return this._coupon;
	}

	static async getRestaurant(restaurantId: number): Promise< Restaurant > {
		return new Promise< Restaurant >( ( resolve ) => {
			Rest.getREST( 'restaurant/', {id: restaurantId } ).then( ( data ) => {
				let restaurant = null;
				if ( data[0] ) {
					restaurant = new Restaurant(-1);
					restaurant.fromObject( data[0] );
				}
				resolve( restaurant );
			})
		});
	}

	static async getCoupon( code: string ): Promise< Coupon > {
		return new Promise< Coupon >( ( resolve ) => {
			Rest.getREST( 'coupon/', { code: code.toUpperCase() } ).then( ( data ) => {
				let coupon = new Coupon(-1);
				if ( data[0] ) {
					coupon.fromObject( data[0] );
				}
				resolve( coupon );
			})
		});
	}

}
