import '../mocks/match-media'
import { SimInput } from "../mocks/sim-input";
import * as fetchMock from 'fetch-mock';
import { MockData } from "../mock-data/db-sql";
import * as fs from "fs";
import { setupBookingFormManager } from "../../src";
import { FormSubmiter } from "../../src/frontend/form-submiter";
import { BookingError } from "../../src/bookings/BookingError";
import { Paypal, PaymentErrors } from '../../src/utils/paypal';
import { PaymentResponse } from "paypal-rest-sdk";
import { Booking } from '../../src/bookings/booking';
import { BookingFormManager } from '../../src/frontend/booking-form-manager';
import { BookingData } from '../../src/bookings/booking-data';

describe( 'FormSubmiter', ()=>{
	let postIdHtml: string[];
	let html: string;
	let summaryBoxHtml: string;
	let paypalContainerHtml: string;
	let formSubmiter: FormSubmiter;
	let dateField: any;
	let formManager: BookingFormManager;
	let paypal: Paypal;

	beforeAll(()=>{
		let mockData = new MockData();
		fetchMock.mock('*', ( url, opts )=>{ return mockData.response( url, opts ) } );
		html = fs.readFileSync('test/frontend/mock-page.html', 'utf8');

		postIdHtml = [
			'<div id="kl-post-id">														',
			'	<div class="elementor-widget-container">				',
			'		<div class="elementor-shortcode">							',
			'			1																						',
			'		</div>																				',
			'	</div>																					',
			'</div>																						'
		];
		summaryBoxHtml = '<div id="kl-summary-box"></div>'
		paypalContainerHtml = '<div id="paypal-button-container"></div>';
	});

	beforeEach(async()=>{
		document.body.innerHTML = html + summaryBoxHtml + paypalContainerHtml + postIdHtml.join(' ');

		dateField = document.getElementById( 'form-field-kl-booking-date' );
		dateField['_flatpickr'] = { config:{} };
		formManager = await setupBookingFormManager();
		paypal = new Paypal( 'paypal-button-container' );
		formSubmiter = new FormSubmiter( formManager, <HTMLFormElement>document.getElementById('kl-booking-form') );
		formSubmiter.registerPaymentProvider( paypal );
		formSubmiter.setSummaryElement( document.getElementById( 'kl-summary-box') );
	});

	describe( 'on bad booking data on submit button', ()=>{
		let scrollMock: jest.Mock;
		let alertMock: jest.Mock;
		let invalidateSpy: jest.SpyInstance<() => Promise<void>>;

		beforeEach( async ()=>{
			scrollMock = jest.fn();
			alertMock = jest.fn();
			Element.prototype.scrollIntoView = scrollMock;
			window.alert = alertMock;
			await SimInput.setValue( 'form-field-kl-children', '3' );
			await SimInput.setValue( 'form-field-kl-booking-date', '' );
			await SimInput.setValue( 'form-field-kl-email', 'test@test.com' );

			// next SimInput statements simulate the fields being erased by the form submit
			SimInput.getInputElementById( 'form-field-kl-children' ).value = '';
			SimInput.getInputElementById( 'form-field-kl-booking-date' ).value = '';
			SimInput.getInputElementById( 'form-field-kl-email' ).value = '';
			invalidateSpy = jest.spyOn( formManager, 'refreshBookingMap' );
			await formSubmiter.formSubmited();
		});

		it( 'should NOT show paypal button', async ()=> {
			expect( document.getElementById( 'paypal-button-container').innerHTML ).toBeFalsy();
		});

		it( 'should show alert to user', async ()=>{
			expect( alertMock ).not.toBeCalled();
		});

		it( 'should refill erased fields', async ()=>{
			expect( SimInput.getInputElementById( 'form-field-kl-adults' ).value ).toEqual( '2' );
			expect( SimInput.getInputElementById( 'form-field-kl-children' ).value ).toEqual( '3' );
			expect( SimInput.getInputElementById( 'form-field-kl-booking-date' ).value ).toEqual( '' );
			expect( SimInput.getInputElementById( 'form-field-kl-email' ).value ).toEqual( 'test@test.com' );
		});

		it( 'should show the user the reason of failure', ()=>{
			let errorText = new BookingError( 'INVALID_DATE' ).message;
			expect( document.getElementById( 'kl-summary-box' ).innerHTML ).toContain( errorText );
		})

		it( 'should make invisible elementor-message-success', ()=>{
			let messageElement = document.getElementById( 'elementor-message-for-test');
			expect( messageElement.style.display ).toEqual( 'none' );
		});

		it( 'should reset date field and refreshBookingMap', ()=>{
			expect( invalidateSpy ).toHaveBeenCalled();
			expect( SimInput.getInputElementById( 'form-field-kl-booking-date' ).value ).toEqual( '' );
		})
	})

	describe( 'on valid button submit event', ()=> {
		let scrollMock: jest.Mock;

		beforeEach( async ()=>{
			scrollMock = jest.fn();
			Element.prototype.scrollIntoView = scrollMock;
			await SimInput.setValue( 'form-field-kl-children', '3' );
			await SimInput.setValue( 'form-field-kl-booking-date', '2018-10-15' );
			await SimInput.setValue( 'form-field-kl-coupon', 'xxaaxx' );
			await SimInput.setValue( 'form-field-kl-name', 'Pepito Grillo' );
			await SimInput.setValue( 'form-field-kl-email', 'test@test.com' );
			await SimInput.setValue( 'form-field-kl-requirements', 'requirements test' );

			// next SimInput statements simulate the fields being erased by the form submit
			SimInput.getInputElementById( 'form-field-kl-adults' ).value = '';
			SimInput.getInputElementById( 'form-field-kl-children' ).value = '';
			SimInput.getInputElementById( 'form-field-kl-booking-date' ).value = '';
			SimInput.getInputElementById( 'form-field-kl-booking-time-0' ).checked = false;
			SimInput.getInputElementById( 'form-field-kl-booking-time-1' ).checked = false;
			SimInput.getInputElementById( 'form-field-kl-coupon' ).value = '';
			SimInput.getInputElementById( 'form-field-kl-name' ).value = '';
			SimInput.getInputElementById( 'form-field-kl-email' ).value = '';
			SimInput.getInputElementById( 'form-field-kl-requirements' ).value = '';
			await formSubmiter.formSubmited();
		});

		it( 'should show a booking summary for user to review', ()=> {
			let genericData = document.getElementById( 'kl-summary-generic-data' ).innerHTML;
			let emailData = document.getElementById( 'kl-summary-email' ).innerHTML;
			let adultsData = document.getElementById( 'kl-summary-adults' ).innerHTML;
			let childrenData = document.getElementById( 'kl-summary-children' ).innerHTML;
			let couponData = document.getElementById( 'kl-summary-discount' ).innerHTML;
			let totalData = document.getElementById( 'kl-summary-total-to-pay' ).innerHTML;

			expect( genericData ).toContain( (new Date('2018-10-15')).toDateString() );
			expect( genericData ).toContain( ' 19:00 ' );
			expect( emailData ).toContain( 'test@test.com' );
			expect( adultsData ).toContain( '2 ' );
			expect( adultsData ).toContain( ' ฿2000 ' );
			expect( childrenData ).toContain( '3 ' );
			expect( childrenData ).toContain( ' ฿1000 ' );
			expect( couponData ).toContain( ' ฿200' );
			expect( totalData ).toContain( ' ฿6800' );
		});

		it( 'should show paypal button', ()=> {
			expect( document.getElementById( 'paypal-button-container').innerHTML ).toContain( 'zoid-paypal-button' );
		});

		it( 'should scroll into summary view', ()=>{
			expect( scrollMock ).toBeCalled();
		});

		it( 'should refill erased fields', ()=>{
			expect( SimInput.getInputElementById( 'form-field-kl-adults' ).value ).toEqual( '2' );
			expect( SimInput.getInputElementById( 'form-field-kl-children' ).value ).toEqual( '3' );
			expect( SimInput.getInputElementById( 'form-field-kl-booking-date' ).value ).toEqual( '2018-10-15' );
			expect( SimInput.getInputElementById( 'form-field-kl-booking-time-0' ).checked ).toBeTruthy();
			expect( SimInput.getInputElementById( 'form-field-kl-booking-time-1' ).checked ).toBeFalsy();
			expect( SimInput.getInputElementById( 'form-field-kl-coupon' ).value ).toEqual( 'xxaaxx' );
			expect( SimInput.getInputElementById( 'form-field-kl-name' ).value ).toEqual( 'Pepito Grillo' );
			expect( SimInput.getInputElementById( 'form-field-kl-email' ).value ).toEqual( 'test@test.com' );
			expect( SimInput.getInputElementById( 'form-field-kl-requirements' ).value ).toEqual( 'requirements test' );
		});
	});

	describe( 'on paypal payment', ()=>{
		let insertSpy: jest.SpyInstance< () => Promise< Booking > >;
		let actions: any;

		beforeEach( async ()=>{
			await SimInput.setValue( 'form-field-kl-adults', '3' );
			await SimInput.setValue( 'form-field-kl-booking-date', '2018-10-15' );
			await SimInput.setValue( 'form-field-kl-email', 'test@test.com' );
			await SimInput.setValue( 'form-field-kl-requirements', 'paypal payment test temp booking' );
			actions = {
				payment: {
					create: jest.fn()
				}
			};
		})

		describe( 'in case payment succesfull', ()=> {
			let paymentResponse: PaymentResponse = {
				intent: '',
				transactions: [{
					amount: {
						currency: 'THB',
						total: '23'
					},
				}],
				payer: {
					payment_method: ''
				},
				httpStatusCode: 1
			};

			xit( 'should fill payment fields on tempBooking and update the database', async ()=> {
				await paypal.payment( {}, actions );
				await paypal.autorized( paymentResponse, actions );
				let booking = await BookingData.getBookings( { comment: 'paypal payment test temp booking' } );

				expect( booking[0].paymentId ).toBeTruthy();
			});

			xit( 'should take user to a thanks page', ()=> {

			});

		});

		describe( 'in case payment failed', ()=> {

			beforeEach( async ()=>{
				await formSubmiter.formSubmited();
				insertSpy = jest.spyOn( paypal.bookingProcessor, 'insertTempBooking' );
			});

			it( 'should inform the user about insertTempBooking failed', async ()=> {
				insertSpy.mockImplementation( ()=> null );
				await paypal.payment( {}, actions );

				expect( document.getElementById( 'kl-summary-box' ).innerHTML ).toContain( PaymentErrors.BOOKING_NOT_AVAILABLE );
			});

			it( 'should refresh calendar on insertTempBooking failure', async()=>{
				let invalidateSpy = jest.spyOn( formManager, 'refreshBookingMap' );
				insertSpy.mockImplementation( ()=> null );
				await paypal.payment( {}, actions );
				await SimInput.delay( 1 );

				expect( invalidateSpy ).toHaveBeenCalled();
				expect( SimInput.getInputElementById( 'form-field-kl-booking-date' ).value ).toEqual( '' );
			});

			it( 'should inform about payment cancelled and persuade to pay again', async ()=> {
				await paypal.payment( {}, actions );
				await paypal.cancelled( {}, actions );

				expect( document.getElementById( 'kl-summary-box' ).innerHTML ).toContain( PaymentErrors.PAYMENT_CANCELLED );
			});

			it( 'should delete tempBooking on payment cancelled', async ()=> {
				await paypal.payment( {}, actions );

				let tempBooking = await BookingData.getBookings( { comment: 'paypal payment test temp booking' } );
				expect( tempBooking.length ).toBeTruthy();

				await paypal.cancelled( {}, actions );

				tempBooking = await BookingData.getBookings( { comment: 'paypal payment test temp booking' } );
				expect( tempBooking.length ).toBeFalsy();
			});

			xit( 'store record of failed transaction', ()=> {

			});

		});

	});

});
