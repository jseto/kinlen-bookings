import {Database} from "./database";
import {MAX_SEATS_PER_GUIDE} from "./guide"
import {Utils} from "./utils";
import { BOOKABLE_TIMES } from "./booking";

export interface BookingSummary {
	guideId: number;
	bookedSeats: number;
}

export class BookingMapper {
	private _restaurantId: number;
	private _restaurantHolidays: boolean[];    // All bookings for the month
	private _bookingMap: BookingSummary[][];  // All bookings for the month by day of the month as 1st array index and time as 2nd array index
  private _lastBookingMapDate: string;
	private _db: Database;

  constructor( restaurantId: number ) {
		this._restaurantId = restaurantId;
    this._bookingMap = [];
		this._restaurantHolidays = [];
    this._lastBookingMapDate = '';
		this._db = new Database();

  }

	async dayBookingSummary( date: string ): Promise<BookingSummary[]> {
		Utils.checkValidDate( date );
		if ( !this.isAvailMapFresh( date ) ) {
			await this.buildBookingMapCache( date );
		}
		let day = new Date( date );
		return this._bookingMap[ day.getDate() ];
	}

	/**
	 * Get the booking summary for a selected day and time and this restaurant
	 * @param  date the date of the required booking
	 * @param  hour the hour of the booking
	 * @return      the booking or null
	 */
	async bookingSummary( date: string, hour: string ):Promise<BookingSummary> {
		let daySummary = await this.dayBookingSummary( date );
		return daySummary[ hour ];
	}

	/**
	 * Retrieves from the cache wether a restaurant is closed or open on date
	 * @param  date the date to check
	 * @return      true if the restaurant is closed
	 */
	async restaurantHoliday( date: string ) {
		Utils.checkValidDate( date );
		if ( !this.isAvailMapFresh( date ) ) {
			await this.buildBookingMapCache( date );
		}
		let day = new Date( date );
		return this._restaurantHolidays[ day.getDate() ];
	}

	async availableSeats( date: string, hour: string ): Promise<number> {
		let booking = await this.bookingSummary( date, hour );
		let holiday = await this.restaurantHoliday( date );
		if ( holiday ) {
			return 0;
		}
		if ( booking ) {  // there is a guide serving this restaurant
			return ( MAX_SEATS_PER_GUIDE - booking.bookedSeats );  // so check if still have seats available
		}
		else { //there is no bookings for this restaurant
			let guide = await this.availableGuide( date );				// so look if there is an available guide
			return guide.maxSeats();
		}
	}

	async isDayAvailable( date: string, requiredSeats: number): Promise<boolean> {
		let daySummary = await this.dayBookingSummary( date );
		let holiday = await this.restaurantHoliday( date );
		console.log( '----------------',holiday )
		if ( holiday ) {
			console.log('holiday false', date )
			return false;
		}
		if ( Object.keys(daySummary).length ) {
			for ( let i = 0; i < BOOKABLE_TIMES.length; ++i ) {
				let time = BOOKABLE_TIMES[i];
				if ( typeof daySummary[ time ] === 'undefined' || ( MAX_SEATS_PER_GUIDE - daySummary[ time ].bookedSeats ) >= requiredSeats ) {
					return true;
				}
			}
			return false;
		}
		else {
			let guide = await this.availableGuide( date );				// so look if there is an available guide
			return ( guide.maxSeats() > 0 );
		}
	}

	invalidateCache() {
		this._lastBookingMapDate = '';
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
			this._restaurantHolidays[i] = false;
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

		let holidays = await this._db.getRestaurantMonthHolidays( this._restaurantId, date );
		holidays.forEach(( holiday )=>{
			let day = new Date( holiday.date ).getDate();
			this._restaurantHolidays[ day ] = true;
		});

		this._lastBookingMapDate = date;
	}

  private isAvailMapFresh( date: string ):boolean {
		return Utils.isSameMonth( this._lastBookingMapDate, date );
  }
}
