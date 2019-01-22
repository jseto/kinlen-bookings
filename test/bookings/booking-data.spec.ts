import * as fetchMock from 'fetch-mock';
import { MockData } from "../mock-data/db-sql";
import { BookingData } from '../../src/bookings/booking-data';
import { Booking } from '../../src/bookings/booking';

describe( 'BookingData', function() {
	let mockData: MockData;
	beforeAll(()=>{
		mockData = new MockData();
		fetchMock.mock('*', ( url, opts )=>{ return mockData.response( url, opts ) } );
	});

	afterAll(()=>{
		fetchMock.restore();
		mockData.close();
	});

	it( 'should return a Booking by id', async ()=> {
		let booking: Booking = await BookingData.getBooking( 3 );

		expect( booking.date ).toEqual( new Date( '2018-09-25' ) );
		expect( booking.time ).toEqual( '21:00:00' );
		expect( booking.timeLength ).toBe( 3000 );
		expect( booking.comment ).toBe( 'this is booking with id 3' );
	});

	it( 'should return all bookings for matching the queryObject', async ()=> {
		let bookings: Booking[] = await BookingData.getBookings( { restaurant_id:1, date:'2018-09-25' } );

		expect( bookings.length ).toBe( 3 );
	});

	describe( 'getMonthBookings should report all bookings for the restaurant in a natural month', ()=>{

		it( 'with query date in the middle of the month', async ()=>{
			let bookings: Booking[] = await BookingData.getMonthBookings( 1, new Date( '2009-08-25' ) );

			expect( bookings.length ).toBe( 4 );
			expect( bookings[1].id ).not.toBe( bookings[0].id );
		});

		it( 'with query date in the begining of the month', async ()=>{
			let bookings: Booking[] = await BookingData.getMonthBookings( 1, new Date( '2009-08-01' ) );

			expect( bookings.length ).toBe( 4 );
			expect( bookings[0].restaurant ).toBe( 1 );
		});

		it( 'with query date in the end of the month', async ()=>{
			let bookings: Booking[] = await BookingData.getMonthBookings( 1, new Date( '2009-08-31' ) );

			expect( bookings.length ).toBe( 4 );
			expect( bookings[0].restaurant ).toBe( 1 );
		});

		it( 'but NOT with query date out of the end of the month', async ()=>{
			let bookings: Booking[] = await BookingData.getMonthBookings( 1, new Date( '2009-09-31' ) );

			expect( bookings.length ).toBe( 0 );
		});

	});

	describe( 'Holiday tables', ()=>{
		it( 'should return a holiday object if have holiday', async ()=>{
			let holiday = await BookingData.getGuideHolidays( 1, new Date( '2017-08-04' ) );
			expect( holiday.length ).toBe( 1 );

		})
		it( 'should return a holiday object if NOT have holiday', async ()=>{
			let holiday = await BookingData.getGuideHolidays( 1, new Date( '2017-08-05' ) );
			expect( holiday.length ).toBe( 0 );

		})
	})

});
