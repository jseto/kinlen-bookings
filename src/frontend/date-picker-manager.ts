import flatpickr from 'flatpickr';
import { BookingMapper, BookingSummary } from "../bookings/booking-mapper";
import { Utils } from "../utils/utils";

export class DatePickerManager {
	private _mapper: BookingMapper;

	constructor( restaurantId: number ) {
		this._mapper = new BookingMapper( restaurantId );
		this._mapper.buildBookingMapCache( Utils.dateToString( new Date() ) );
	}

	setDisabledDates( _selectedDates, _dateStr, instance: flatpickr.Instance ) {
		this.updateDates( instance );
	//		console.log('monthChange ', instance.currentMonth);
	}

	async updateDates( instance: flatpickr.Instance ) {
		let date = new Date( instance.currentYear, instance.currentMonth, 1)
		return await this._mapper.getUnavailableDays( date, 2 ).then(( map )=>{
			instance.config.disable = map;
			console.log( map );
			instance.redraw();
		})
	}

	// getFreeTimeSlots( date:string, callback: ( bookingSummary: BookingSummary[] ) => void ) {
	// 	return this._mapper.dayBookingSummary().then( bookingSummary =>{
	// 		callback( bookingSummary );
	// 	});
	// }
}
