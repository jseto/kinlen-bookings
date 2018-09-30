import {Database} from "./database";
import {Booking} from "./booking"
import {Guide} from "./guide"
import {Utils} from "./utils";

export interface TimeSlot {
	time: number;
	availableSeats: number;
}

export class BookingMapper {
	private _restaurantId: number;
	private _bookings: Booking[];    // All bookings for the month
	private _bookingMap: Booking[][];  // All bookings for the month by day of the month as 1st array index and time as 2nd array index
	private _freeGuide: Guide;
  private _lastBookingMapDate: string;

  constructor( restaurantId: number ) {
		this._restaurantId = restaurantId;
    this._bookingMap = [];
		this._bookings = [];
    this._lastBookingMapDate = '';
  }

	/**
	 * Get the booking for a selected day and time and this restaurant
	 * @param  date the date of the required booking
	 * @param  hour the hour of the booking
	 * @return      the booking or null
	 */
	async booking( date: string, hour: string ){
		Utils.checkValidDate( date );
		if ( !this.isAvailMapFresh( date ) ) {
			await this.fetchBookingMap( date )
			this.buildBookingMap( date );
			this._lastBookingMapDate = date;
		}
		let day = new Date( date );
		return this._bookingMap[ day.getDate(), hour ];
	}

	isAvailable( date: string, hour: string, seats: number ){
		let g = this.booking( date, hour );
		if ( g ) {  // there is a guide serving this restaurant
			return ( g.availableSeats() - seats ) >= 0;  // so check if still have seats available
		}
		else { //there is no bookings for this restaurant
			return this.availableGuide( date, hour );				// so look if there is an available guide
		}
	}

  availableGuide( date: string, hour: string ): any {
    throw new Error("Method not implemented.");
  }

	private buildBookingMap( date ) {
		let d = new Date( date );
		for ( let i = 1; i <= 31; i++) {
			this._bookings.forEach( ( booking )=>{
				let bd = new Date( booking.date );
				if ( bd.getDay() == d.getDay() ) {
					this._bookingMap[i][booking.time] = booking;
				}
				else {
					this._bookingMap[i] = null;
				}
			});
		}
	}

	private async freeGuide( date: string ) {
		if ( ! this._freeGuide ) {
			let db = new Database();
			this._freeGuide = await db.getFreeGuide( date );
		}
		return this._freeGuide;
	}

  private async fetchBookingMap( date: string ) {
      let db = new Database();
      this._bookings = await db.getMonthBookings( this._restaurantId, date );
			return this._bookings;
  }

  private isAvailMapFresh( date: string ):boolean {
		return Utils.isSameMonth( this._lastBookingMapDate, date );
  }
}
