import {Database} from "./database";
import {MAX_SEATS_PER_GUIDE} from "./guide"
import {Utils} from "./utils";

export interface BookingSummary {
	guideId: number;
	bookedSeats: number;
}

export class BookingMapper {
	private _restaurantId: number;
//	private _bookings: Booking[];    // All bookings for the month
	private _bookingMap: BookingSummary[][];  // All bookings for the month by day of the month as 1st array index and time as 2nd array index
  private _lastBookingMapDate: string;
	private _db: Database;

  constructor( restaurantId: number ) {
		this._restaurantId = restaurantId;
    this._bookingMap = [];
//		this._bookings = [];
    this._lastBookingMapDate = '';
		this._db = new Database();

  }

	/**
	 * Get the booking summary for a selected day and time and this restaurant
	 * @param  date the date of the required booking
	 * @param  hour the hour of the booking
	 * @return      the booking or null
	 */
	async bookingSummary( date: string, hour: string ): Promise<BookingSummary> {
		Utils.checkValidDate( date );
		if ( !this.isAvailMapFresh( date ) ) {
			await this.buildBookingMapCache( date );
		}
		let day = new Date( date );
		return this._bookingMap[ day.getDate() ][ hour ];
	}

	async availableSeats( date: string, hour: string ): Promise<number> {
		let g = await this.bookingSummary( date, hour );
		if ( g ) {  // there is a guide serving this restaurant
			return ( MAX_SEATS_PER_GUIDE - g.bookedSeats );  // so check if still have seats available
		}
		else { //there is no bookings for this restaurant
			let guide = await this.availableGuide( date );				// so look if there is an available guide
			return guide.maxSeats();
		}
	}

  availableGuide( date: string ) {
		return this._db.getFreeGuide( date )
  }

	/**
	 * Retrieves the bookings for the month in date and builds the booking map
	 * and stores it in local memory for subsequent uses
	 * @param  date the date where the month to retrieve bookings is taken
	 * @return      a promise of
	 */
	async buildBookingMapCache( date ) {
		for ( let i=0; i<32; i++ ) {
			this._bookingMap[i] = [];
		}

		let bookings = await this._db.getMonthBookings( this._restaurantId, date );
		bookings.forEach(( booking )=>{
			let day = new Date( booking.date ).getDate();
			let bday = this._bookingMap[ day ];
			if ( bday && bday[ booking.time ] ) {
				this._bookingMap[ day ][ booking.time ].bookedSeats += booking.bookedSeats;
			}
			else {
				this._bookingMap[ day ][ booking.time ]= {
					bookedSeats: booking.bookedSeats,
					guideId: booking.assignedGuide.id
				};
			}
		});
		this._lastBookingMapDate = date;
	}

  private isAvailMapFresh( date: string ):boolean {
		return Utils.isSameMonth( this._lastBookingMapDate, date );
  }
}
