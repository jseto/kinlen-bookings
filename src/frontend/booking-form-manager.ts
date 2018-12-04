import { Instance as FlatpickrInstance} from "flatpickr/dist/types/instance";
import { BookingMapper } from "../bookings/booking-mapper";
import { Observer, ObservableField, ObservableRadio, ObservableSelect, ObservableRadioGroup } from '../utils/observer';
import { MAX_SEATS_PER_GUIDE } from '../bookings/guide';
import { BookingProcessor, RawBooking } from "../bookings/booking-processor";
import { Paypal } from "../utils/paypal";
import { Utils } from "../utils/utils";

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
  private _paypalContainerElement: string;

	constructor( formElementId: string, initialState: FormState) {
		super( initialState );
		this._formElement = <HTMLFormElement>document.getElementById( formElementId );
		this._formElement.onsubmit = ()=>this.formSubmited();
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

	setPaypalContainerElement( element: string ) {
		this._paypalContainerElement = element;
		return this;
	}

	async formSubmited() {
		let booking = this.rawBooking();
		let processor = new BookingProcessor( booking );
		let validBooking = false;

		try {
			validBooking = await processor.validateBooking();
		} catch(_e){}

		this.refillFields( booking );

		if ( validBooking ) {
			let paypal = new Paypal( processor );

			this._summary.innerHTML = await this.createSummaryHtml( processor );
			this._summary.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
				inline: 'nearest'
			});

			if ( document.getElementById( this._paypalContainerElement ) ) {
				paypal.renderButton( this._paypalContainerElement );
			}
			else throw new Error( 'Paypal container element not found' );
		}
		else {
			alert( 'There was a problem with your booking data. Please, check all required fields are correct.');
		}

	}

	private async createSummaryHtml( p: BookingProcessor ) {
		let b = await p.booking();
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

	private refillFields( booking: RawBooking) {
		(<HTMLInputElement>this.observables.adults.element).value = String( booking.adults );
		(<HTMLInputElement>this.observables.children.element).value = String( booking.children );
		(<HTMLInputElement>this.observables.date.element).value = String( Utils.isInvalid( booking.date)? '' : booking.date.toISOString().slice( 0, 10 ) );
		(<ObservableRadioGroup>this.observables.time).checkRadioButtonElements( booking.time.slice( 0, 5 ) );
		(<HTMLInputElement>this.observables.name.element).value = booking.name;
		(<HTMLInputElement>this.observables.email.element).value = booking.email;
		(<HTMLInputElement>this.observables.coupon.element).value = booking.coupon;
		(<HTMLInputElement>this.observables.comment.element).value = booking.comment;
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
