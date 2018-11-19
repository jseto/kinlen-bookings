import { Booking } from "../../src/bookings/booking";
import { BookingMapper } from "../../src/bookings/booking-mapper";

export interface BookingData {
	restautantId: number,
	date: Date,
	time: string,
	adults: number,
	children: number,
}
export class BookingProcessor {
	private _bookingData: BookingData;

	constructor( bookingData: BookingData ) {
		this._bookingData = bookingData;
	}

	async validateBooking() {
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
}
