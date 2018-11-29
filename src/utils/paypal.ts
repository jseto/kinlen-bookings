import { Payment, Item } from "paypal-rest-sdk";
import * as paypal from "paypal-checkout";
import { BookingProcessor } from "../bookings/booking-processor";

export class Paypal {
	private _bookingProcessor: BookingProcessor;

	constructor( bookingProcessor: BookingProcessor ) {
		this._bookingProcessor = bookingProcessor;
	}

	async payment( _data, actions ) {
		let obj = await this.getPayment();
		return actions.payment.create( obj );
	}

	autorized( _data, actions ) {
		return actions.payment.execute()
							.then( function () {
      					window.alert('Payment Complete!');
    					});
	}

	renderButton( anchorElement: string ): Promise< void > {
		let cfg = this.buttonConfig()
		console.log('Button Rendered -----------------',paypal.Button.render )
		return new Promise< void >( resolve => {
			paypal.Button.render( cfg, anchorElement ).then(()=>resolve() );
		})
	}

	buttonConfig() {
		return {
			env: 'sandbox', // sandbox | production
			style: this.buttonStyle(),
			funding: this.funding(),
			// Enable Pay Now checkout flow (optional)
			commit: true,
			client: this.secrets(),
			payment: this.payment,
			onAuthorize: this.autorized,
			onRender: ()=> console.log('reeeendered---------->>>>>>>>>>', document.body.innerHTML)
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
				paypal.FUNDING.CREDIT
			],
			disallowed: []
		}
	}

	private buttonStyle() {
		return {
			layout: 'vertical',  // horizontal | vertical
			size:   'medium',    // medium | large | responsive
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
			note_to_payer: 'Contact us at bookings@bestthaifood.info for any questions on your booking.'
		}
	}

	private async getItemList(): Promise< Item[] > {
		let booking = await this._bookingProcessor.prepareBooking();
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
		    name: 'Adults',
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
