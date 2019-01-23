import { Payment, Item } from "paypal-rest-sdk";
import * as paypal from "paypal-checkout";
import { BookingProcessor } from "../bookings/booking-processor";
import { Booking } from "../bookings/booking";
import { PaymentData } from "../frontend/form-submiter";

export const PaymentErrors = {
	BOOKING_NOT_AVAILABLE: 'The selected booking slot is no longer available. Please select another date or time slot or try later.',
	PAYMENT_CANCELLED: 'The payment has not been fulfilled. Please try again to guaranty your booking.',
	PAYMENT_ERROR: 'There has been an error during the payment process. Please try again to guaranty your booking.'
}

export abstract class PaymentProvider {
	constructor( anchorElement: string ) {
		this._anchorElement = anchorElement;
	}

	abstract renderButton(): Promise< void >;

	set onAuthorize( callBack: ( paymentData: PaymentData ) => Promise<any> ) {
		this._onAuthorize = callBack;
	}

	get onAuthorize() {
		return this._onAuthorize;
	}

	set onError( callBack: ( errorMsg: string )=> void ) {
		this._onError = callBack;
	}

	get onError() {
		return this._onError;
	}

	set onCancel( callBack: ()=>Promise<any> ) {
		this._onCancel = callBack;
	}

	get onCancel() {
		return this._onCancel;
	}

	setBookingProcessor( processor: BookingProcessor ) {
		this._bookingProcessor = processor;
		return this;
	}

	get bookingProcessor() {
		return this._bookingProcessor;
	}

	get anchorElement() {
		return this._anchorElement;
	}

	protected _anchorElement: string;
	private _bookingProcessor: BookingProcessor;
	private _onAuthorize: ( paymentData: PaymentData ) => Promise<any>;
	private _onError: ( errorMsg: string ) => void;
	private _onCancel: () => Promise<any>;
}

export class Paypal extends PaymentProvider{

	async payment( _data: any, actions: any ) {
		let tempBookingInserted: Booking = null;

		tempBookingInserted = await this.bookingProcessor.insertTempBooking();
		if ( !tempBookingInserted ) {
			if ( this.onError ) this.onError( PaymentErrors.BOOKING_NOT_AVAILABLE );
			return false;
		}

		let obj = {
			payment: await this.getPayment(),
			experience: {
	 			input_fields: {
		 			no_shipping: 1
	 			}
 			}
		}
		return actions.payment.create( obj );
	}

	autorized( _data: any, actions: any ) {
		return actions.payment.execute()
			.then( ( data: Payment ) => {
				if ( data.state === 'approved' && this.onAuthorize ) {
					let payData: PaymentData = {
						paymentId: data.id,
						paymentProvider: data.payer.payment_method,
						paidAmount: Number( data.transactions[0].amount.total ),
						currency: data.transactions[0].amount.currency
					}
					this.onAuthorize( payData )
				}
				if ( data.state !== 'approved' && this.onError ) this.onError( PaymentErrors.PAYMENT_ERROR );
			});
	}

	async cancelled( _data: any, _actions: any ) {
		if ( this.onCancel ) this.onCancel();
	}

	error( err: string ) {
		if ( this.onError ) this.onError( err );
	}

	renderButton(): Promise< void > {
		let element = document.getElementById( this._anchorElement );
		while ( element.firstChild ) element.removeChild( element.firstChild );

		return new Promise< void >( resolve => {
			let cfg = this.buttonConfig( resolve )
			paypal.Button.render( cfg, '#' + this._anchorElement ).then(()=>resolve() );
		})
	}

	buttonConfig( resolve: () => void ) {
		return {
			env: 'sandbox', // sandbox | production
			locale: 'en_US',
			style: this.buttonStyle(),
			funding: this.funding(),
			// Enable Pay Now checkout flow (optional)
			commit: true,
			client: this.secrets(),
			payment: ( data: any, actions: any ) => this.payment( data, actions ),
			onAuthorize: ( data: any, actions: any ) => this.autorized( data, actions ),
			onCancel: ( data: any, actions: any ) => this.cancelled( data, actions ),
			onError: this.error,
			onRender: ()=> resolve()
		}
	}

	private secrets() {
		return {
			sandbox: 'AYrSBefLwtleGdIfw-g2SDZBu0ejMEPxLgFVG4aldURXvuhB8yCahg8Si45psKTwzk0gYJV66dkXvwsN',
			production: 'AS7fAX4ZytJ-D9m0IkJ5DQYSiJO0TN9l9600ehFoNCIoC0WVmpSmcvMQSLz0OZ9R67uYlW-gorz-1IDY'
		}
	}

	private funding() {
		// Options:
		// - paypal.FUNDING.CARD
		// - paypal.FUNDING.CREDIT
		// - paypal.FUNDING.ELV
		return {
			allowed: [
				paypal.FUNDING.CARD,
			],
			disallowed: [
				paypal.FUNDING.CREDIT
			]
		}
	}

	private buttonStyle() {
		return {
			layout: 'vertical',  // horizontal | vertical
			size:   'responsive',    // medium | large | responsive
			shape:  'rect',      // pill | rect
			color:  'gold'       // gold | blue | silver | white | black
		}
	}

	private async getPayment(): Promise< Payment > {
		let total = await this.bookingProcessor.totalToPay();
		let items = await this.getItemList();
		let restaurant = await this.bookingProcessor.restaurant();

		return {
			payer:{
				payment_method: 'paypal'
			},
			intent: 'sale',
			transactions: [{
				amount: {
					total: total.toString(),
					currency: 'THB',
				},
				description: 'Your booking for '+ restaurant.name,
				//invoice_number: '12345', Insert a unique invoice number
				item_list: {
					items: items,
				}
			}],
			// note_to_payer: 'Contact us at bookings@bestthaifood.info for any questions on your booking.' !!!!!opens a window in paypal hiding important info
		}
	}

	private async getItemList(): Promise< Item[] > {
		let booking = await this.bookingProcessor.booking();
		let items:Item[] = [];
		let adultItem: Item = {
			currency: 'THB',
	    name: 'Adults',
	    price: booking.adultPrice.toString(),
	    quantity: booking.adults
		}
		items.push( adultItem );

		if ( booking.children ) {
			let childrenItem: Item = {
				currency: 'THB',
		    name: 'Children',
		    price: booking.childrenPrice.toString(),
		    quantity: booking.children
			}
			items.push( childrenItem );
		}

		if ( booking.couponValue ) {
			let discount = - booking.couponValue;
			let discountItem: Item = {
				currency: 'THB',
		    name: 'Discount Coupon',
		    price: discount.toString(),
		    quantity: 1
			}
			items.push( discountItem );
		}

		return items;
	}

}
