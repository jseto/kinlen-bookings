import flatpickr from 'flatpickr';
import { BookingMapper, BookingSummary } from "../bookings/booking-mapper";
import { Utils } from "../utils/utils";

export class DatePickerManager {
	private _mapper: BookingMapper;

	constructor( restaurantId: number ) {
		this._mapper = new BookingMapper( restaurantId );
		this._mapper.buildBookingMapCache( Utils.dateToString( new Date() ) );
	}

	setup2( element: string ) {
		flatpickr( element, {
			disableMobile: true,
			onOpen: this.setDisabledDates,
			onMonthChange: this.setDisabledDates,
			// flatpickr.config.onChange = enableTimeSlots;
		});
	}

	setup( calendar: ({})=> void ) {
		calendar({
			disableMobile: true,
			onOpen: this.setDisabledDates,
			onMonthChange: this.setDisabledDates,
			// onChange: enableTimeSlots
		})
		// flatpickr.config.disableMobile = true;
		// flatpickr.config.onOpen = [this.setDisabledDates];
		// flatpickr.config.onMonthChange = [this.setDisabledDates];
		// // flatpickr.config.onChange = enableTimeSlots;
	}

	setDisabledDates( _selectedDates, _dateStr, instance ) {
		this.updateDates( instance );
	//		console.log('monthChange ', instance.currentMonth);
	}

	updateDates( instance: flatpickr.Instance ) {
		let date = new Date( instance.currentYear, instance.currentMonth, 1)
		this._mapper.getUnavailableDays( date, 2 ).then(( map )=>{
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
