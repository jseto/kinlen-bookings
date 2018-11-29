import '../mocks/match-media'
import { Paypal } from "../../src/utils/paypal";
import * as fetchMock from 'fetch-mock';
import { MockData } from './../mock-data/db-sql';
import { BookingProcessor } from '../../src/bookings/booking-processor';
import { Booking } from '../../src/bookings/booking';

describe( 'paypal checkout button', ()=>{
	let booking: Booking;

	beforeAll(()=>{
		let mockData = new MockData();
		fetchMock.mock('*', ( url, opts )=>{ return mockData.response( url, opts ) } );
	});

	beforeEach(()=>{
		document.body.innerHTML = '<div id="paypal-button"></div>';

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
	});

	it( 'should display button', async ()=>{
		let bookingProcessor = new BookingProcessor( booking )
		let paypal = new Paypal( bookingProcessor );
		await paypal.renderButton( '#paypal-button' )
		expect( document.getElementById( 'paypal-button' ).firstElementChild.classList ).toContain( 'paypal-button' );
	});

	xit( 'should create a payment', async ()=>{

	});

});
