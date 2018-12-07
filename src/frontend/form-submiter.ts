import { BookingFormManager } from "./booking-form-manager";
import { BookingProcessor, RawBooking } from "../bookings/booking-processor";
import { ObservableRadioGroup } from "../utils/observer";
import { Utils } from "../utils/utils";
import { Paypal } from "../utils/paypal";

export class FormSubmiter {

	constructor( formManager: BookingFormManager, formElement: HTMLFormElement ) {
		this._formManager = formManager;
		this._formElement = formElement;
		this._formElement.onsubmit = ()=>this.formSubmited();
	}

	setPaypalContainerElement(element: string) {
		this._paypalContainerElement = element;
	}

	setSummaryElement( element: HTMLElement) {
		this._summary = element;
	}

	async formSubmited() {
		let paypalContainer = document.getElementById( this._paypalContainerElement );
		let booking = this._formManager.rawBooking();
		let processor = new BookingProcessor( booking );
		let validBooking = false;

		try {
			validBooking = await processor.validateBooking( true );
		} catch( e ){
			this._summary.innerHTML = this.createErrorHtml( e.message );
		}

		if ( validBooking ) {
			let paypal = new Paypal( processor );

			this._summary.innerHTML = await this.createSummaryHtml( processor );

			if ( paypalContainer ) {
				paypal.renderButton( this._paypalContainerElement );
			}
			else throw new Error( 'Paypal container element not found' );

		}

		this.refillFields( booking );

		paypalContainer.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
			inline: 'nearest'
		});

	}

  private createErrorHtml( message: string ): string {
		let elementorSuccess: HTMLElement = <HTMLElement>this._formElement.getElementsByClassName( 'elementor-message-success' ).item(0);
		if (elementorSuccess) elementorSuccess.style.display = 'none';

		let element: string[] = [];
		element.push( '<h3>An error occurred while processing you booking</h3>' );
		element.push( '<p style="color:red;">' + message + '</p>' );
		element.push( '<h4>Please, review the details of your booking</h4>' );
    return element.join( '\n' );
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
	private _paypalContainerElement: string;
	private _summary: HTMLElement;
	private _formElement: HTMLFormElement;
}
