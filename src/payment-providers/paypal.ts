import { Payment, Item } from "paypal-rest-sdk";
import * as paypal from "paypal-checkout";
import { PaymentProvider, PaymentErrors, PaymentData } from "./payment-provider";

export class Paypal extends PaymentProvider{

	async payment( _data: any, actions: any ) {
		if ( this.onStartPayment && await this.onStartPayment() ) {
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
		else return false;
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
		if ( this.onCancel ) {
			return this.onCancel();
		}
		else {
			return false;
		}

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
