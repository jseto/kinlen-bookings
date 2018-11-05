import flatPickr from "flatpickr";
import { BookingMapper } from "./booking-mapper";

export class DatePickerManager {
	private _mapper;

	constructor( restaurantId: number ) {
		this._mapper = new BookingMapper( restaurantId )
	}

	setup( instanceId: string ) {
		flatPickr( instanceId, {
	//		disable: mapper.getUnavailableDays( calendar.flatpickr().currentMonth, 2 ),
	//				disable: ["2018-11-30", "2018-11-21", "2018-11-08", new Date(2018, calendar.flatpickr().currentMonth, 9)],
			onMonthChange: this.setDisabledDates,
			onOpen: this.setDisabledDates
		});
	}

	private async setDisabledDates( selectedDates, _dateStr, instance ) {
		let map = await this._mapper.getUnavailableDays( selectedDates[0], 2 );
		instance.config.disable = map;
		instance.redraw();
	//		console.log('monthChange ', instance.currentMonth);
	}
}
