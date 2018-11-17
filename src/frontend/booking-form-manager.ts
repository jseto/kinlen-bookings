import flatpickr from 'flatpickr';
import { BookingMapper } from "../bookings/booking-mapper";
import { Observer, ObservableField, ObservableRadio } from '../utils/observer';

interface TimeOption {
  time: string,
	observable: ObservableRadio
}

interface State {
	adults?: number;
	children?: number;
	date?: string;
	time?: string;
	coupon?: string;
	name?: string;
	email?: string;
	requirements?: string;
}

export class BookingFormManager extends Observer< State > {
	private _mapper: BookingMapper;
  private _timeOption: TimeOption[];

	constructor( restaurantId: number ) {
		super();
		this._timeOption = [];
		this._mapper = new BookingMapper( restaurantId );
		this._mapper.buildBookingMapCache( new Date() );
	}

	registerNumericElements( elements: {}) {
		for( let name in elements ) {
			let observable = new ObservableField<number>( name, elements[ name ] );
			this.registerObservable( observable );
			observable.onChange = ()=> this.resetDate();
		}
		return this;
	}

	registerStringElements( elements: {}) {
		for( let name in elements ) {
			this.registerObservable( new ObservableField<string>( name, elements[ name ] ) );
		}
		return this;
	}

	addTimeOption( time: string, element: string ) {
		let radioButton = new ObservableRadio( time, element );
		this.registerObservable( radioButton );
		this._timeOption.push({
			time: time,
			observable: radioButton
		});
		return this;
	}

	setCalendar( calendar: flatpickr.Instance ) {
		calendar.config.disableMobile = true;
		calendar.config.onMonthChange = [( _selectedDates, _dateStr, instance )=> this.updateDates(instance)];
		calendar.config.onOpen = [( _selectedDates, _dateStr, instance )=>this.updateDates(instance)];
		calendar.config.onChange = [( selectedDates )=> this.dateSet( selectedDates[0] )];

		return this;
	}

	private resetDate() {
		this.setState({date: ''});
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
			isAvailable? timeOpt.observable.show() : timeOpt.observable.hide();
			if ( first && isAvailable ) {
				timeOpt.observable.value = true;
				first = false;
			}
		})
	}

	private requiredSeats(): number {
    return this.state.adults + this.state.children;
  }
}
