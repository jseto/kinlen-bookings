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
			adults: 6,
			children: 0,
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

	});

	describe( 'the payment process', ()=> {

		xit( 'should collect financial data', ()=> {

		});

		xit( 'should accept booking on a fulfilled payment', ()=> {

		});

		xit( 'should reject booking in any other case', ()=> {

		});

	});

});
