import { Booking } from "../../src/bookings/booking";
import { BookingMapper } from "../../src/bookings/booking-mapper";
import { Restaurant } from "./restaurant";
import { Rest } from "../database/rest";

export interface BookingData {
	restautantId: number,
	date: Date,
	time: string,
	adults: number,
	children: number,
	name: string,
	email: string,
	coupon: string,
	requirements: string
}

export class BookingProcessor {
	private _bookingData: BookingData;
	private _restaurant: Restaurant;

	constructor( bookingData: BookingData ) {
		this._bookingData = bookingData;
	}

	async booking() {
		let booking = new Booking(-1);
		booking.fromObject( this._bookingData );
		booking.setRestaurant( await this.restautant() );
	}

	async totalAmount(): Promise<number> {
		let restautant = await this.restautant();
		let couponValue = await this.couponValue();
		let adultTotal = restautant.adultPrice * this._bookingData.adults;
		let childrenTotal = restautant.childrenPrice * this._bookingData.children
		return adultTotal + childrenTotal - couponValue;
	}

  async couponValue(): Promise<number> {
    throw new Error("Method not implemented.");
  }

	async validateBooking(): Promise< boolean > {
		let mapper = new BookingMapper( this._bookingData.restautantId );
		return await mapper.isTimeSlotAvailable( this._bookingData.date, this._bookingData.time, this.bookedSeats() )
	}

	async validatePayment(): Promise<boolean> {
		throw new Error("Method not implemented.");
  }

	async bookingInserted(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

	async process():Promise<boolean> {
		let valid: boolean = await this.validateBooking()
								&& await this.validatePayment()
								&& await this.bookingInserted();

		return new Promise<boolean>((resolve)=> resolve( valid ) );
	}

	private bookedSeats() {
		return this._bookingData.adults + this._bookingData.children;
	}

	private async restautant(): Promise< Restaurant > {
		if( !this._restaurant ) {
			this._restaurant = await this.getRestaurant( this._bookingData.restautantId );
		}
		return this._restaurant;
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

}
