import { BookingFormManager } from "./booking-form-manager";
import { BookingProcessor, RawBooking } from "../bookings/booking-processor";
import { ObservableRadioGroup } from "../utils/observer";
import { Utils } from "../utils/utils";
import { PaymentProvider, PaymentData, PaymentErrors } from "../payment-providers/payment-provider";

export class FormSubmiter {
	constructor( formManager: BookingFormManager, formElement: HTMLFormElement ) {
		this._paymentProviders = [];
		this._formManager = formManager;
		this._formElement = formElement;
		this._formElement.onsubmit = ()=>this.formSubmited();
	}

	setSummaryElement( element: HTMLElement) {
		this._summary = element;
	}

	registerPaymentProvider(paymentProvider: PaymentProvider): any {
		paymentProvider.onError = ( msg ) => this.paymentError( msg );
		paymentProvider.onCancel = () => this.paymentCancelled();
		paymentProvider.onAuthorize = ( data ) => this.paymentAuthorized( data );
		paymentProvider.onStartPayment = () => this.startPayment();
		this._paymentProviders.push( paymentProvider );
  }

	async formSubmited(): Promise<void> {
		let container = document.getElementById( this._paymentProviders[0].anchorElement );
		let booking = this._formManager.rawBooking();
		this._processor = new BookingProcessor( booking );
		let validBooking = false;

		try {
			validBooking = await this._processor.validateBooking( true );
		} catch( e ){
			this.paymentError( e.message );
		}

		if ( validBooking ) {
			await this.showSummary( this._processor );

			if ( container ) {
				this._paymentProviders.forEach( ( provider ) => {
					provider.setBookingProcessor( this._processor );
					provider.renderButton();
				});
			}
			else throw new Error( 'Paypal container element not found' );
		}

		container.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
			inline: 'nearest'
		});

		return new Promise<void>( resolve => {
			setTimeout(()=>{
				let elementorSuccess: HTMLElement = <HTMLElement>this._formElement.getElementsByClassName( 'elementor-message-success' ).item(0);
				if ( !validBooking && elementorSuccess) elementorSuccess.style.display = 'none';
				this.refillFields( booking );
				resolve();
			},50);
		})
	}

	private async startPayment(): Promise<boolean> {
		let tempBooking = await this._processor.insertTempBooking();
		if ( !tempBooking ) {
			this.paymentError( PaymentErrors.BOOKING_NOT_AVAILABLE );
		}
		return tempBooking != null;
	}

	private async paymentAuthorized( data: PaymentData ) {

	}

  private async paymentCancelled(): Promise<boolean>  {
		this.showPaymentError( PaymentErrors.PAYMENT_CANCELLED );
		let result = await this._processor.deleteTempBooking();
		if ( !result ) {
			throw new Error( 'Unable to delete temp booking' );
		}
		return result;
  }

	private paymentError( errorText: string ) {
		this._formManager.refreshBookingMap();
		this.showPaymentError( errorText );
	}

	private showPaymentError( errorText: string) {
		let element: string[] = [];
		element.push( '<h3>An error occurred while processing you booking</h3>' );
		element.push( '<p style="color:red;">' + errorText + '</p>' );
		element.push( '<h4>Please, review the details of your booking</h4>' );

		this._summary.innerHTML = element.join( '\n' );
	}

	private async showSummary( p: BookingProcessor ) {
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
		this._summary.innerHTML = element.join('\n');
	}

	private refillFields( booking: RawBooking) {
		(<HTMLInputElement>this._formManager.observables.adults.element).value = String( booking.adults );
		(<HTMLInputElement>this._formManager.observables.children.element).value = String( booking.children );
		(<HTMLInputElement>this._formManager.observables.date.element).value = String( Utils.isInvalid( booking.date)? '' : booking.date.toISOString().slice( 0, 10 ) );
		(<ObservableRadioGroup>this._formManager.observables.time).checkRadioButtonElements( booking.time.slice( 0, 5 ) );
		(<HTMLInputElement>this._formManager.observables.name.element).value = booking.name;
		(<HTMLInputElement>this._formManager.observables.email.element).value = booking.email;
		(<HTMLInputElement>this._formManager.observables.coupon.element).value = booking.coupon;
		(<HTMLInputElement>this._formManager.observables.comment.element).value = booking.comment;
	}

	private _formManager: BookingFormManager;
	private _summary: HTMLElement;
	private _formElement: HTMLFormElement;
	private _processor: BookingProcessor;
	private _paymentProviders: PaymentProvider[];
}
