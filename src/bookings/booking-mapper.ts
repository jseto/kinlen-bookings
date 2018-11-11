import {BookingData} from "./booking-data";
import {MAX_SEATS_PER_GUIDE, Guide} from "./guide"
import { BOOKABLE_TIMES } from "./booking";

export interface BookingSummary {
	guideId: number;
	bookedSeats: number;
}

export class BookingMapper {
	private _restaurantId: number;
	private _restaurantHolidays: boolean[];    // All bookings for the month
	private _availableGuide: Guide[];
	private _bookingMap: BookingSummary[][];  // All bookings for the month by day of the month as 1st array index and time as 2nd array index
  private _lastBookingMapDate: Date;
	private _db: BookingData;

  constructor( restaurantId: number ) {
		this._restaurantId = restaurantId;
    this._bookingMap = [];
		this._restaurantHolidays = [];
		this._availableGuide = [];
    this._lastBookingMapDate = new Date( 0 );
		this._db = new BookingData();

  }

	async dayBookingSummary( date: Date ): Promise<BookingSummary[]> {
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
	async bookingSummary( date: Date, hour: string ):Promise<BookingSummary> {
		let daySummary = await this.dayBookingSummary( date );
		return daySummary[ hour ];
	}

	/**
	 * Retrieves from the cache wether a restaurant is closed or open on date
	 * @param  date the date to check
	 * @return      true if the restaurant is closed
	 */
	async restaurantHoliday( date: Date ) {
		if ( !this.isAvailMapFresh( date ) ) {
			await this.buildBookingMapCache( date );
		}
		let day = new Date( date );
		return this._restaurantHolidays[ day.getDate() ];
	}

	async availableSeats( date: Date, hour: string ): Promise<number> {
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
			return guide != null? guide.maxSeats() : 0;
		}
	}

	async isDayAvailable( date: Date, requiredSeats: number): Promise<boolean> {
		let daySummary = await this.dayBookingSummary( date );
		let holiday = await this.restaurantHoliday( date );
		if ( holiday ) {
			return false;
		}
		if ( Object.keys(daySummary).length ) { //have some booking for the day
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
			return guide != null;
		}
	}

	async getUnavailableDays( date: Date, seats: number ): Promise<Date[]> {
		let days:Date[] = [];
		let daysInMonth = new Date( date.getFullYear(), date.getMonth()+1, 0 ).getDate();
		for ( let i = 1; i <= daysInMonth; ++i ) {
			date.setDate( i );
			let available = await this.isDayAvailable( date, seats );
			if ( !available ) {
				days.push( new Date( date ) );
			}
		}
		return days;
	}

	invalidateCache() {
		this._lastBookingMapDate = new Date( 0 );
	}

  async availableGuide( date: Date ) {
		if ( !this.isAvailMapFresh( date ) ) {
			await this.buildBookingMapCache( date );
		}
		let day = new Date( date );
		return this._availableGuide[ day.getDate() ];
  }

  // availableGuide( date: Date ) {
	// 	return this._db.getFreeGuide( date )
  // }

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
			this._availableGuide[i] = null;
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

		let availableGuides = await this._db.getMonthFreeGuide( date );
		availableGuides.forEach( (guide)=>{
			let day = new Date( guide.date ).getDate();
			this._availableGuide[ day ] = guide;
		});

		this._lastBookingMapDate = date;
	}

  private isAvailMapFresh( date: Date ):boolean {
		return this._lastBookingMapDate.getMonth() == date.getMonth();
  }
}
