import { Booking } from "../../src/bookings/booking";
import { BookingMapper } from "../../src/bookings/booking-mapper";
import { Restaurant } from "./restaurant";
import { Rest } from "../database/rest";
import { Coupon } from "./coupon";

export interface BookingData {
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
  private _restaurant: Restaurant;
	private _coupon: Coupon;
	private _booking: Booking;

	constructor( bookingData: BookingData ) {
		this._booking = new Booking(-1);
		this._booking.fromObject( bookingData );
	}

	async prepareBooking() {
		let restaurant = await this.restaurant();
		let coupon = await this.coupon();
		let beforeDiscount = await this.beforeDiscount();
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
		let restaurant = await this.restaurant();
		let adultTotal = restaurant.adultPrice * this._booking.adults;
		let childrenTotal = restaurant.childrenPrice * this._booking.children;
		return adultTotal + childrenTotal;
	}

	async isCouponValid() {
		let c = await this.coupon();
		return c.isValid();
	}

	async validateBooking(): Promise< boolean > {
		let mapper = new BookingMapper( this._booking.restaurant );
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
								&& await this.isCouponValid()
								&& await this.validatePayment()
								&& await this.bookingInserted();

		return new Promise<boolean>((resolve)=> resolve( valid ) );
	}

	private bookedSeats() {
		return this._booking.adults + this._booking.children;
	}

	async restaurant(): Promise< Restaurant > {
		if( !this._restaurant ) {
			this._restaurant = await BookingProcessor.getRestaurant( this._booking.restaurant );
		}
		return this._restaurant;
	}

	private async coupon(): Promise< Coupon > {
		if( !this._coupon ) {
			this._coupon = await BookingProcessor.getCoupon( this._booking.coupon );
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
