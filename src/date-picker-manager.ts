import * as flatpickr from "flatpickr";
import { BookingMapper } from "./booking-mapper";

export class DatePickerManager {
	private _mapper;

	constructor( restaurantId: number ) {
		this._mapper = new BookingMapper( restaurantId )
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
}
