import * as fetchMock from 'fetch-mock';
import { MockData } from './../mock-data/db-sql';
import { BookingProcessor, BookingData } from '../../src/bookings/booking-processor';

describe( 'The BookingProcessor is in charge of place a booking in the System', ()=> {
	let bookingData: BookingData;

	beforeAll(()=>{
		let mockData = new MockData();
		fetchMock.mock('*', ( url, opts )=>{ return mockData.response( url, opts ) } );
		bookingData = {
			restautantId: 1,
			date: new Date( '2018-10-10' ),
			time: '19:00:00',
			adults: 4,
			children: 2,
			coupon: '',
			name: 'pepito grillo',
			email: 'p.grillo@gmail.com',
			requirements: 'no special requirements',
		}
	});

	describe( 'the booking', ()=>{

		it( 'should accept a booking that cannot be placed', async ()=> {
			bookingData.date = new Date( '2018-10-10' );
			let processor = new BookingProcessor( bookingData );
			expect( await processor.validateBooking() ).toBeTruthy()
		});

		it( 'should reject a booking that cannot be placed', async()=> {
			bookingData.date = new Date( '2018-10-05' );
			let processor = new BookingProcessor( bookingData );
			expect( await processor.validateBooking() ).toBeFalsy()
		});

		xit( 'should create a booking object',()=>{

		});

	});

	describe( 'the payment process', ()=> {

		xit( 'should calculate the total amount', async ()=> {
			let processor = new BookingProcessor( bookingData );
			expect( await processor.totalAmount() ).toBe( 10000 );
			bookingData.adults = 2;
			bookingData.children = 4;
			expect( await processor.totalAmount() ).toBe( 8000 );
		});

		xit( 'should discount coupon value for a valid coupon', async ()=> {

		});

		xit( 'should NOT discount when NOT a valid coupon', async ()=> {

		});

		xit( 'should NOT discount when expired coupon', async ()=> {

		});

		xit( 'should collect financial data', async ()=> {

		});

		xit( 'should accept booking on a fulfilled payment', ()=> {

		});

		xit( 'should reject booking in any other case', ()=> {

		});

	});

});
