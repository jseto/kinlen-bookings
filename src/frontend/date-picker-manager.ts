import * as flatpickr from "flatpickr";
import { BookingMapper, BookingSummary } from "../bookings/booking-mapper";
import { Utils } from "../utils/utils";

export class DatePickerManager {
	private _mapper;

	constructor( restaurantId: number ) {
		this._mapper = new BookingMapper( restaurantId )
		this._mapper.buildBookingMapCache( Utils.dateToString( new Date() ) )
	}

	// setup( flatPickrInstance: flatpickr.default.Instance ) {
	// 	flatPickrInstance.config.onOpen = [this.setDisabledDates];
	// 	flatPickrInstance.config.onMonthChange = [this.setDisabledDates];
	// }
	//
	// setDisabledDates( _selectedDates, _dateStr, instance ) {
	// 	this.updateDates( instance );
	// //		console.log('monthChange ', instance.currentMonth);
	// }

	updateDates( instance: flatpickr.default.Instance ) {
		let date = new Date( instance.currentYear, instance.currentMonth, 1)
		return this._mapper.getUnavailableDays( date, 2 ).then(( map )=>{
			instance.config.disable = map;
			console.log( map );
			instance.redraw();
		})
	}

	getFreeTimeSlots( date:string, callback: ( bookingSummary: BookingSummary[] ) => void ) {
		return this._mapper.dayBookingSummary().then( bookingSummary =>{
			callback( bookingSummary );
		});
	}
}
