import { Payment, Item } from "paypal-rest-sdk";
import * as paypal from "paypal-checkout";
import { BookingProcessor } from "../bookings/booking-processor";
import { Booking } from "../bookings/booking";
import { FormSubmiter } from "../frontend/form-submiter";

const _paymentErrors = {
	BOOKING_NOT_AVAILABLE: 'The selected booking slot is no longer available. Please select another date or time slot or try later.',
}

export class Paypal {

	constructor( formSubmiter: FormSubmiter, bookingProcessor: BookingProcessor ) {
		this._bookingProcessor = bookingProcessor;
		this._formSubmiter = formSubmiter;
	}

	async payment( _data: any, actions: any ) {
		let tempBookingInserted: Booking = null;

		tempBookingInserted = await this._bookingProcessor.insertTempBooking();
		if ( !tempBookingInserted ) {
			this._formSubmiter.showPaymentError( _paymentErrors.BOOKING_NOT_AVAILABLE );
			return false;
		}

		let obj = await this.getPayment();
		obj[ 'application_context' ] = {
			shipping_preference: 'NO_SHIPPING'
		};
		return actions.payment.create( obj );
	}

	autorized( _data: any, actions: any ) {
		return actions.payment.execute()
							.then( function () {
      					window.alert('Payment Complete!');
    					});
	}

	cancelled( _data: any, _actions: any ) {
		throw Error('cancelled not implemented')
	}

	error( err: string ) {
		throw Error('error not implemented ' + err )
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
			onAuthorize: this.autorized,
			onCancel: this.cancelled,
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
	private _formSubmiter: FormSubmiter;
}
