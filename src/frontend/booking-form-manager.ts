import { Instance as FlatpickrInstance} from "flatpickr/dist/types/instance";
import { BookingMapper } from "../bookings/booking-mapper";
import { Observer, ObservableField, ObservableRadio, ObservableSelect, ObservableRadioGroup } from '../utils/observer';
import { MAX_SEATS_PER_GUIDE } from '../bookings/guide';
import { RawBooking } from "../bookings/booking-processor";
import { FormSubmiter } from "./form-submiter";
import { PaymentProvider } from "../payment-providers/payment-provider";

export interface FormState {
	adults?: number;
	children?: number;
	date?: string;
	time?: string;
	coupon?: string;
	name?: string;
	email?: string;
	comment?: string;
}

export const initialState: FormState = {
	adults: 0,
	children: 0,
	date: '',
	time: '',
	coupon: '',
	name: '',
	email: '',
	comment: '',
}

export class BookingFormManager extends Observer< FormState > {

	constructor( formElementId: string, initialState: FormState) {
		super( initialState );
		this._submiter = new FormSubmiter( this, <HTMLFormElement>document.getElementById( formElementId ) );
	}

	rawBooking(): RawBooking {
		let booking: any = this.state;
		booking.date = new Date( this.state.date );
		booking.time = this.state.time + ':00';
		booking.restaurant_id = this._mapper.restaurantId;
		return booking as RawBooking;
	}

	async setRestaurant( restaurantId: number ) {
		this._mapper = new BookingMapper( restaurantId );
		await this._mapper.buildBookingMapCache( new Date() );
		return this;
	}

	async refreshBookingMap() {
		await this._mapper.buildBookingMapCache( new Date() );
		this.resetDate();
	}

	registerSelectElements( elements: {}) {
		for( let name in elements ) {
			let observable = new ObservableSelect<number>( name, elements[ name ], 0 );
			this.registerObservable( observable );
		}
		this.observables.adults.onChange = ()=> this.adultsChanged();
		this.observables.children.onChange = ()=> this.resetDate();
		return this;
	}

	registerStringElements( elements: {}) {
		for( let name in elements ) {
			this.registerObservable( new ObservableField<string>( name, elements[ name ], '' ) );
		}
		return this;
	}

	registerRadioGroup( name: string, radioButtons: {} ) {
		let radioGroup = new ObservableRadioGroup( name, '' );
		for ( let name in radioButtons ) {
			radioGroup.addRadioButton( new ObservableRadio( name, radioButtons[ name ] ) );
		}
		this.registerObservable( radioGroup );
		return this;
	}

	setCalendar( calendar: FlatpickrInstance ) {
		calendar.config.disableMobile = true;
		calendar.config.onMonthChange = [( _selectedDates, _dateStr, instance )=> this.updateDates(instance)];
		calendar.config.onOpen = [( _selectedDates, _dateStr, instance )=>this.updateDates(instance)];
		calendar.config.onChange = [( selectedDates )=> this.dateSet( selectedDates[0] )];

		this.observables.date.onChange = ()=> this.dateSet( new Date( this.state.date ) );
		(<HTMLInputElement>this.observables.date.element).readOnly = true;

		return this;
	}

	setSummaryElement( element: string ) {
		this._submiter.setSummaryElement( document.getElementById( element ) );
		return this;
	}

	registerPaymentProvider( paymentProvider: PaymentProvider ) {
		this._submiter.registerPaymentProvider( paymentProvider );
		return this;
	}


	private adultsChanged(): void {
		let children = (<ObservableSelect<number>>this.observables.children);
		let options: string[] = [];
		let maxChildren = MAX_SEATS_PER_GUIDE - this.state.adults + 1;
		for ( let i = 0; i < maxChildren; i++ ){  options[ i ] = String( i ) }
		children.setOptions( options )
		this.resetDate();
  }

	private async updateDates( instance: FlatpickrInstance ) {
		let date = new Date( instance.currentYear, instance.currentMonth, 1)
		let map = await this._mapper.getUnavailableDays( date, this.requiredSeats() );
		instance.config.disable = map;
		console.log( map );
		instance.redraw();
	}

	private radioButtons() {
		return ( <ObservableRadioGroup>this.observables.time ).radioButtons;
	}

	private dateSet( date: Date )  {
		let first = true;
		this.radioButtons().forEach( async timeOpt => {
			let isAvailable = await this._mapper.isTimeSlotAvailable( date, timeOpt.name + ':00', this.requiredSeats() );
			isAvailable? timeOpt.show() : timeOpt.hide();
			if ( first && isAvailable ) {
				timeOpt.value = true;
				first = false;
			}
		})
//		this.observables.name.focus();
	}

	private resetDate() {
		this.setState({date: ''})
		this.radioButtons().forEach( timeOpt => timeOpt.show() );
		this.radioButtons()[0].value = true;
	}

	private requiredSeats(): number {
    return this.state.adults + this.state.children;
  }

	private _mapper: BookingMapper;
	private _submiter: FormSubmiter;
}
