import { Instance as FlatpickrInstance} from "flatpickr/dist/types/instance";
import { BookingMapper } from "../bookings/booking-mapper";
import { Observer, ObservableField, ObservableRadio, ObservableSelect, ObservableRadioGroup } from '../utils/observer';
import { MAX_SEATS_PER_GUIDE } from '../bookings/guide';
import { Booking } from "../bookings/booking";
import { BookingProcessor } from "../bookings/booking-processor";

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
	private _formElement: HTMLFormElement;
	private _mapper: BookingMapper;
  private _summary: HTMLElement;

	constructor( formElementId: string, initialState: FormState) {
		super( initialState );
		this._formElement = <HTMLFormElement>document.getElementById( formElementId );
		this._formElement.onsubmit = ()=>this.formSubmited();
	}

	getBooking() {
		let booking = new Booking(-1)
		booking.fromObject( this.state );
		booking.setTime( this.state.time + ':00' );
		booking.setRestaurant( this._mapper.restaurantId );
		return booking;
	}

	async setRestaurant( restaurantId: number ) {
		this._mapper = new BookingMapper( restaurantId );
		await this._mapper.buildBookingMapCache( new Date() );
		return this;
	}

	get restaurant() {
		return this._mapper.restaurantId;
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

	registerRadioGroup( name, radioButtons: {} ) {
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
		this._summary = document.getElementById( element );
		return this;
	}

	async formSubmited() {
		let processor = new BookingProcessor( this.getBooking() )
		this._summary.innerHTML = await this.createSummaryHtml( processor );
	}

	private async createSummaryHtml( p: BookingProcessor ) {
		let b = await p.prepareBooking();
		let restaurant = await p.restaurant()
		let element: string[] = [];
		element.push( '	<h3>Please, review the details of your booking</h3>' );
		element.push( '		<p id="kl-summary-generic-data">You will book on ' + b.date.toDateString() + ' at ' + b.time.slice( 0, 5 ) + ' in restaurant ' + restaurant.name + '</p>' );
		element.push( '		<p id="kl-summary-email">In case we need to contact you, we will send an email to: ' + b.email + '</p>' );
		element.push( '		<p id="kl-summary-adults">' + b.adults + ' adults at ฿' + b.adultPrice + ' each</p>' );
		if ( b.children ) {
			element.push( '	<p id="kl-summary-children">' + b.children + ' children at ฿' + b.childrenPrice + ' each</p>' );
		}
		if (b.couponValue ) {
			element.push( '	<p id="kl-summary-discount">Discount coupon. Value ฿' + b.couponValue + '</p>');
		}
		element.push( '	<h4 id="kl-summary-total-to-pay">Total to pay: ฿' + await p.totalToPay() + '</h4>' )
		return element.join('\n');
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
			let isAvailable = await this._mapper.isTimeSlotAvailable( date, timeOpt.name, this.requiredSeats() );
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
}
