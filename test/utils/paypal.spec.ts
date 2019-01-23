import '../mocks/match-media'
import * as fetchMock from 'fetch-mock';
import { MockData } from './../mock-data/db-sql';
import { BookingProcessor, RawBooking } from '../../src/bookings/booking-processor';
import { Paypal } from '../../src/payment-providers/paypal';

describe( 'paypal checkout button', ()=>{
	let booking: RawBooking;
	let paypalElement: HTMLElement;
	let paypal: Paypal;
	let bookingProcessor: BookingProcessor;

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
		paypal = new Paypal( 'paypal-button-container' );
		paypal.setBookingProcessor( bookingProcessor );
		await paypal.renderButton()
	});

	it( 'should display button', async ()=>{
		expect( paypalElement.firstElementChild.classList ).toContain( 'paypal-button' );
	});

	describe( 'on press payment button', ()=>{
		let actions: any;
		let mockedStartPayment: jest.Mock<{}>;
		let mockedErrorCallback: jest.Mock<{}>;

		beforeEach(()=>{
 			actions = {
				payment: {
					create: jest.fn()
				}
			};
			mockedStartPayment = jest.fn();
			mockedErrorCallback = jest.fn();
			paypal.onError = mockedErrorCallback;
			paypal.onStartPayment = mockedStartPayment;
		});

		it( 'should call onStartPayment and process the payment if no error', async ()=>{
			mockedStartPayment.mockImplementation( ()=> true );
			await paypal.payment( {}, actions );
			expect( mockedStartPayment ).toHaveBeenCalled();
			expect( actions.payment.create ).toHaveBeenCalled();
		});

		it( 'should not process payment on error', async ()=>{
			mockedStartPayment.mockImplementation( ()=> false );
			await paypal.payment( {}, actions );
			expect( actions.payment.create ).not.toHaveBeenCalled();
		});

	});
});
