import '../mocks/match-media'
import { Paypal } from "../../src/utils/paypal";
import * as fetchMock from 'fetch-mock';
import { MockData } from './../mock-data/db-sql';
import { BookingProcessor } from '../../src/bookings/booking-processor';
import { Booking } from '../../src/bookings/booking';

xdescribe( 'paypal checkout button', ()=>{
	let booking: Booking;
	let paypalElement: HTMLElement;

	beforeAll(()=>{
		let mockData = new MockData();
		fetchMock.mock('*', ( url, opts )=>{ return mockData.response( url, opts ) } );
	});

	beforeEach( async()=>{
		document.body.innerHTML = '<div id="paypal-button-container"></div>';

		booking = new Booking( -1 );
		booking.fromObject({
			restaurant_id: 1,
			date: '2018-10-10',
			time: '19:00:00',
			adults: 4,
			children: 2,
			coupon: '',
			name: 'Pepito Grillo',
			email: 'p.grillo@gmail.com',
			comment: 'no special requirements',
		});
		let bookingProcessor = new BookingProcessor( booking )
		let paypal = new Paypal( bookingProcessor );
		await paypal.renderButton( '#paypal-button-container' )
		paypalElement = document.getElementById( 'paypal-button-container' );
	});

	it( 'should display button', async ()=>{
		expect( paypalElement.firstElementChild.classList ).toContain( 'paypal-button' );
	});

	xit( 'should create a payment', async ()=>{

	});

});
