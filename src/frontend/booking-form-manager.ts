import flatpickr from 'flatpickr';
import { BookingMapper } from "../bookings/booking-mapper";

interface TimeOption {
  time: string,
	element: JQuery<HTMLElement>
}

// interface State {
// 	adults: number;
// 	children: number;
// 	date: string;
// 	time: string;
// 	coupon: string;
// 	name: string;
// 	email: string;
// 	requirements: string;
// }

export class BookingFormManager {
	private _mapper: BookingMapper;
  private _timeOption: TimeOption[];
  private _adultsElement: JQuery<HTMLElement>;
  private _childrenElement: JQuery<HTMLElement>;

	constructor( restaurantId: number ) {
		this._timeOption = [];
		this._mapper = new BookingMapper( restaurantId );
		this._mapper.buildBookingMapCache( new Date() );
		this._childrenElement.change()
	}

	setPeopleElem( adultsElem: string, childrenElem: string ) {
    this._adultsElement = jQuery( adultsElem );
		this._childrenElement = jQuery( childrenElem );
		return this;
  }

	// setNameElem( element: string) {
  //   return this;
  // }

	setCalendarElem( element: string ) {
		let calendar: any = jQuery( element );
		calendar.flatpickr({
			disableMobile: true,
			onMonthChange: ( _selectedDates, _dateStr, instance )=> this.updateDates(instance),
			onOpen: ( _selectedDates, _dateStr, instance )=>this.updateDates(instance),
			onChange: ( selectedDates )=> this.dateSet( selectedDates[0] )
		});
		return this;
	}

	addTimeOptionElem( time: string, element: string ) {
		this._timeOption.push({
			time: time + ':00',
			element: jQuery( element )
		});
		return this;
	}

	adults(): number {
		let val: string = this._adultsElement.val() as string;
		if ( val === '' ) {
			return Number( this._adultsElement.attr('placeholder') );
		}
		else {
			return Number( val );
		}
	}

	children(): number {
		return Number( this._childrenElement.val() );
	}

	private async updateDates( instance: flatpickr.Instance ) {
		let date = new Date( instance.currentYear, instance.currentMonth, 1)
		let map = await this._mapper.getUnavailableDays( date, 2 );
		instance.config.disable = map;
		console.log( map );
		instance.redraw();
	}

	private dateSet( date: Date ) {
		let first = true;
		this._timeOption.forEach( async timeOpt => {
			let isAvailable = await this._mapper.isTimeSlotAvailable( date, timeOpt.time, this.requiredSeats() );
			isAvailable? timeOpt.element.parent().show() : timeOpt.element.parent().hide();
			if ( first && isAvailable ) {
				timeOpt.element.prop( 'checked', true );
				first = false;
			}
		})
	}

	private requiredSeats(): number {
    return this.adults() + this.children();
  }
}
