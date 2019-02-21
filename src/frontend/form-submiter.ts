import { BookingFormManager } from "./booking-form-manager";
import { BookingProcessor, RawBooking } from "../bookings/booking-processor";
import { ObservableRadioGroup } from "../utils/observer";
import { Utils } from "../utils/utils";
import { PaymentProvider, PaymentData, PaymentErrors } from "../payment-providers/payment-provider";
import { BookingError } from "../bookings/BookingError";

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
		paymentProvider.onError = ( error ) => this.paymentError( error );
		paymentProvider.onCancel = () => this.paymentCancelled();
		paymentProvider.onAuthorize = ( data ) => this.paymentAuthorized( data );
		paymentProvider.onStartPayment = () => this.startPayment();
		this._paymentProviders.push( paymentProvider );
  }

	async formSubmited(): Promise<void> {
		this.hideInfoPanels();
		let booking = this._formManager.rawBooking();
		this._processor = new BookingProcessor( booking );
		let validBooking = false;

		try {
			validBooking = await this._processor.validateBooking( true );
		} catch( e ){
			this.paymentError( e );
		}

		let payElementContainer: HTMLElement;// = document.getElementById( this._paymentProviders[0].anchorElementId );

		if ( validBooking ) {
			await this.showSummary( this._processor );

			this._paymentProviders.forEach( ( provider ) => {
				payElementContainer = document.getElementById( provider.anchorElementId );
				payElementContainer.style.display = 'block';
				provider.setBookingProcessor( this._processor );
				provider.renderButton();
			});
		}

		let container = payElementContainer || this._summary;
		if ( container ) {
			container.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
				inline: 'nearest'
			});
		}

		return new Promise<void>( resolve => {
			setTimeout(()=>{
				let elementorSuccess: HTMLElement = <HTMLElement>this._formElement.getElementsByClassName( 'elementor-message-success' ).item(0);
				if ( !validBooking && elementorSuccess) elementorSuccess.style.display = 'none';
				this.refillFields( booking );
				resolve();
			},50);
		})
	}

	private hideInfoPanels() {
		this._paymentProviders.forEach(( provider )=> {
			let anchorElement = document.getElementById( provider.anchorElementId );
			anchorElement.style.display = 'none';
		});
		this._summary.style.display = 'none';
	}

	private async startPayment(): Promise<boolean> {
		let tempBooking = await this._processor.insertTempBooking();
		if ( !tempBooking ) {
			this.paymentError( new BookingError( PaymentErrors.BOOKING_NOT_AVAILABLE ) );
		}
		return tempBooking != null;
	}

	private async paymentAuthorized( data: PaymentData ) {
		let booking = await this._processor.persistTempBooking( data );
		if ( !booking ) {
			this.paymentError( new BookingError(PaymentErrors.BOOKING_NOT_UPDATED) );
			return false;
		}
		window.location.assign( '/thanks/?id=' + booking.id );
		return true;
	}

  private async paymentCancelled(): Promise<boolean>  {
		this.showPaymentError( PaymentErrors.PAYMENT_CANCELLED );
		let result = await this._processor.deleteTempBooking();
		if ( !result ) {
			throw new Error( 'Unable to delete temp booking' );
		}
		return result;
  }

	private paymentError( error: BookingError ) {
		if ( error.code != 'INVALID_COUPON' ) {
			this._formManager.refreshBookingMap();
		}
		this.showPaymentError( error.message );
	}

	private showPaymentError( errorText: string) {
		let element: string[] = [];
		element.push( '<h3>An error occurred while processing you booking</h3>' );
		element.push( '<p style="color:red;">' + errorText + '</p>' );
		element.push( '<h4>Please, review the details of your booking</h4>' );

		this._summary.innerHTML = element.join( '\n' );
		this._summary.style.display = 'block';
	}

	private async showSummary( p: BookingProcessor ) {
		let b = await p.booking();
		let restaurant = await p.restaurant()
		let element: string[] = [];
		element.push( '	<h3>Please, review the details of your booking</h3>' );
		element.push( '		<p id="kl-summary-generic-data">You are booking for ' + b.date.toDateString() + ' at ' + b.time.slice( 0, 5 ) + ' in restaurant ' + restaurant.name + '</p>' );
		element.push( '		<p id="kl-summary-email">We will send the pick-up point address and booking details to to: ' + b.email + '</p>' );
		element.push( '		<p id="kl-summary-adults">' + b.adults + ' adults at ฿' + b.adultPrice + ' each</p>' );
		if ( b.children ) {
			element.push( '	<p id="kl-summary-children">' + b.children + ' children at ฿' + b.childrenPrice + ' each</p>' );
		}
		if (b.couponValue ) {
			element.push( '	<p id="kl-summary-discount">Discount coupon value: ฿' + b.couponValue + '</p>');
		}
		element.push( '	<h4 id="kl-summary-total-to-pay">Total to pay: ฿' + await p.totalToPay() + '</h4>' )
		this._summary.innerHTML = element.join('\n');
		this._summary.style.display = 'block';
	}

	private refillFields( booking: RawBooking) {
		(<HTMLInputElement>this._formManager.observables.adults.element).value = String( booking.adults );
		(<HTMLInputElement>this._formManager.observables.children.element).value = String( booking.children );
		(<HTMLInputElement>this._formManager.observables.name.element).value = booking.name;
		(<HTMLInputElement>this._formManager.observables.email.element).value = booking.email;
		(<HTMLInputElement>this._formManager.observables.coupon.element).value = booking.coupon;
		(<HTMLInputElement>this._formManager.observables.comment.element).value = booking.comment;
		(<HTMLInputElement>this._formManager.observables.date.element).value = String( Utils.isInvalid( booking.date)? '' : booking.date.toISOString().slice( 0, 10 ) );
		(<ObservableRadioGroup>this._formManager.observables.time).checkRadioButtonElements( booking.time.slice( 0, 5 ) );
	}

	private _formManager: BookingFormManager;
	private _summary: HTMLElement;
	private _formElement: HTMLFormElement;
	private _processor: BookingProcessor;
	private _paymentProviders: PaymentProvider[];
}
