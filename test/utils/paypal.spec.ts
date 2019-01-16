import '../mocks/match-media'
import { Paypal } from "../../src/utils/paypal";
import * as fetchMock from 'fetch-mock';
import { MockData } from './../mock-data/db-sql';
import { BookingProcessor, RawBooking } from '../../src/bookings/booking-processor';
import { FormSubmiter } from '../../src/frontend/form-submiter';
import { Booking } from '../../src/bookings/booking';

describe( 'paypal checkout button', ()=>{
	let booking: RawBooking;
	let paypalElement: HTMLElement;
	let paypal: Paypal;
	let bookingProcessor: BookingProcessor;
	let formSubmiter: { showPaymentError: jest.Mock<{}>; };

	beforeAll(()=>{
		let mockData = new MockData();
		fetchMock.mock('*', ( url, opts )=>{ return mockData.response( url, opts ) } );
	});

	beforeEach( async()=>{
		document.body.innerHTML = '<div id="paypal-button-container"></div>';

		booking = {
			restaurant_id: 1,
			date: new Date('2018-10-10'),
			time: '19:00:00',
			adults: 4,
			children: 2,
			coupon: '',
			name: 'Pepito Grillo',
			email: 'p.grillo@gmail.com',
			comment: 'no special requirements',
		};
		bookingProcessor = new BookingProcessor( booking )
		paypalElement = document.getElementById( 'paypal-button-container' );
		formSubmiter = {
			showPaymentError: jest.fn()
		}
		paypal = new Paypal( <FormSubmiter><unknown>formSubmiter, bookingProcessor );
		await paypal.renderButton( 'paypal-button-container' )
	});

	// afterEach(()=>{
	// 	formSubmiter.showPaymentError.mockReset();
	// });

	it( 'should display button', async ()=>{
		expect( paypalElement.firstElementChild.classList ).toContain( 'paypal-button' );
	});

	describe( 'on press payment button', ()=>{
		let actions: any;
		let insertSpy: jest.SpyInstance< () => Promise< Booking > >;

		beforeEach(()=>{
 			actions = {
				payment: {
					create: jest.fn()
				}
			};
			insertSpy = jest.spyOn( bookingProcessor, 'insertTempBooking' );
		});

		it( 'should create a temp booking', async ()=>{
			insertSpy.mockImplementation( ()=> new Booking(300) );
			await paypal.payment( {}, actions );
			expect( insertSpy ).toHaveBeenCalled();
			expect( formSubmiter.showPaymentError ).not.toHaveBeenCalled();
		});

		it( 'should display error message if insertTempBooking fails', async ()=>{
			insertSpy.mockImplementation( ()=> null );
			await paypal.payment( {}, actions );
			expect( formSubmiter.showPaymentError ).toHaveBeenCalled();
		});
	});
});
