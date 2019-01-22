import { Payment, Item, PaymentResponse } from "paypal-rest-sdk";
import * as paypal from "paypal-checkout";
import { BookingProcessor } from "../bookings/booking-processor";
import { Booking } from "../bookings/booking";

export const PaymentErrors = {
	BOOKING_NOT_AVAILABLE: 'The selected booking slot is no longer available. Please select another date or time slot or try later.',
	PAYMENT_CANCELLED: 'The payment has not been fulfilled. Please try again to guaranty your booking'
}

export class Paypal {

	constructor( bookingProcessor: BookingProcessor ) {
		this._bookingProcessor = bookingProcessor;
	}

	set onAuthorize( callBack: ( paymentData: PaymentResponse ) => Promise<any> ) {
		this._onAuthorize = callBack;
	}

	set onError( callBack: ( errorMsg: string )=> void ) {
		this._onError = callBack;
	}

	set onCancel( callBack: ()=>Promise<any> ) {
		this._onCancel = callBack;
	}

	get bookingProcessor() {
		return this._bookingProcessor;
	}

	async payment( _data: any, actions: any ) {
		let tempBookingInserted: Booking = null;

		tempBookingInserted = await this._bookingProcessor.insertTempBooking();
		if ( !tempBookingInserted ) {
			if ( this._onError ) this._onError( PaymentErrors.BOOKING_NOT_AVAILABLE );
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

	autorized( data: PaymentResponse, actions: any ) {
		return actions.payment.execute()
			.then(()=>{
				if ( this._onAuthorize ) this._onAuthorize( data )
			});
	}

	async cancelled( _data: any, _actions: any ) {
		if ( this._onCancel ) this._onCancel();
	}

	error( err: string ) {
		if ( this._onError ) this._onError( err );
	}

	renderButton( anchorElement: string ): Promise< void > {
		let element = document.getElementById( anchorElement );
		while ( element.firstChild ) element.removeChild( element.firstChild );

		return new Promise< void >( resolve => {
			let cfg = this.buttonConfig( resolve )
			paypal.Button.render( cfg, '#' + anchorElement ).then(()=>resolve() );
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
		let total = await this._bookingProcessor.totalToPay();
		let items = await this.getItemList();
		let restaurant = await this._bookingProcessor.restaurant();

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
		let booking = await this._bookingProcessor.booking();
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

	private _bookingProcessor: BookingProcessor;
	private _onAuthorize: ( paymentData: PaymentResponse ) => Promise<any>;
	private _onError: ( errorMsg: string ) => void;
	private _onCancel: () => Promise<any>;

}
