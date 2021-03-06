import { Booking } from "../../src/bookings/booking";
import { BookingMapper } from "../../src/bookings/booking-mapper";
import { Restaurant } from "./restaurant";
import { Rest } from "../database/rest";
import { Coupon } from "./coupon";
import { Utils } from "../utils/utils";
import { BookingError } from "../../src/bookings/BookingError";
import { PaymentData } from "../payment-providers/payment-provider";
import { Affiliate } from "../affiliate/affiliate";

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

	async insertTempBooking(): Promise< Booking > {
		let booking = await this.booking();
		booking.setPaid( false );
		booking.setPaidAmount( 0 );
		let mapper = new BookingMapper( booking.restaurant ); // ensures getting a fresh copy of mapper
		if ( await this.validateBooking() ) {
			booking
				.setAssignedGuide( await mapper.assignGuide( booking.date, booking.time ) )
				.setAffiliateId( Affiliate.get() );
			this._booking = await BookingProcessor.insertBooking( booking );
			return this._booking;
		}
		else {
			return null;
		}
	}

	async deleteTempBooking(): Promise< boolean > {
		let booking = await this.booking();
		if ( booking.id >= 0 ) {
			return await BookingProcessor.deleteBooking( booking );
		}
		else return false;
	}

	async persistTempBooking( data: PaymentData ): Promise< Booking > {
		let booking = await this.booking();
		if ( booking.id >= 0 ) {
			booking
				.setPaymentId( data.paymentId )
				.setPaymentProvider( data.paymentProvider )
				.setPaidAmount( data.paidAmount )
				.setCurrency( data.currency )
				.setPaid( true );
			if ( await BookingProcessor.updateBooking( booking ) ) {
				return booking;
			}
		}
		return null;
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

	static async insertBooking( booking: Booking ): Promise< Booking > {
		let obj = booking.toObject();
		delete obj.id;
		return new Promise< Booking >( resolve => {
			Rest.postREST( 'booking/', obj ).then( data => {
				if ( data[0] )	booking.fromObject( data[0] );
				resolve( booking );
			})
		});
	}

	static async deleteBooking( booking: Booking ): Promise< boolean > {
		return <Promise< boolean > >Rest.deleteREST( 'booking/', { id: booking.id, token: booking.token } );
	}

	static updateBooking( booking: Booking ): Promise<boolean> {
		let obj = booking.toObject();
		return new Promise< boolean >( resolve => {
			Rest.putREST( 'booking/', obj ).then( data => {
				resolve( data != 0 );
			})
		});
  }

	private _rawBooking: RawBooking;
  private _restaurant: Restaurant;
	private _coupon: Coupon;
	private _booking: Booking;
}
