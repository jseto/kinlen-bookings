import * as fetchMock from 'fetch-mock';
import { MockData } from './mock-data/db-sql';
import { Database } from "../src/database";
import { Booking } from "../src/booking";

describe( 'Database helpers', ()=>{
	describe( 'objectToQueryString method:', ()=>{
		it( 'Should work for unitary objects', ()=>{
			let db = new Database();
			let obj = {
				date: '2018-09-25'
			}
			let query = db.objectToQueryString( obj );
			expect( query ).toEqual( '?date=2018-09-25' );
		});
	});
});

describe( 'Mock data', ()=>{
	let mockData: MockData;

	beforeEach(()=>{
		mockData = new MockData();
	})

	afterEach(()=>{
		mockData.close();
	})

	it( 'should return all elements from endpoint when no url parameter',()=>{
		let resp = mockData.response( '/wp-json/kinlen/mock_data_test_data/' );
		expect( resp.length ).toBe( 2 );
	})

	it( 'Should return one element when querying id', ()=>{
		let resp = mockData.response( '/wp-json/kinlen/mock_data_test_data/?id=1' );
		expect( resp.length ).toBe( 1 );
		expect( resp[0].name ).toEqual( 'Pankaj' );
	});

	it( 'Should return one element when querying id 2 parameters', ()=>{
		let resp = mockData.response( '/wp-json/kinlen/mock_data_test_data/?id=2&name=David' );
		expect( resp.length ).toBe( 1 );
		expect( resp[0].salary ).toBe( 5000 );
	});

	it( 'should insert data on post method', ()=>{
		let resp = mockData.response( '/wp-json/kinlen/mock_data_test_data/', {
															method: 'POST',
															body: JSON.stringify({
																id:4,
																name: "Pepe",
																salary: 2500
															})
														});
		expect( resp ).toBeTruthy();
		let resp2 = mockData.response( '/wp-json/kinlen/mock_data_test_data/?id=4' );
		expect( resp2[0].name ).toEqual( 'Pepe' );
	});
});

describe( 'Database', function() {
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
		let db = new Database();
		let booking: Booking = await db.getBooking( 3 );

		expect( booking.date ).toEqual( '2018-09-25' );
		expect( booking.time ).toEqual( "21:00:00" );
		expect( booking.timeLength ).toBe( 3000 );
	});

	it( 'should return all bookings for matching the queryObject', async ()=> {
		let db = new Database();
		let bookings: Booking[] = await db.getBookings( { restaurant_id:1, date:'2018-09-25' } );

		expect( bookings.length ).toBe( 3 );
	});

	describe( 'getMonthBookings should report all bookings for the restaurant in a natural month', ()=>{

		it( 'with query date in the middle of the month', async ()=>{
			let db = new Database();
			let bookings: Booking[] = await db.getMonthBookings( 1, '2019-08-25' );

			expect( bookings.length ).toBe( 4 );
			expect( bookings[1].id ).not.toBe( bookings[0].id );
		});

		it( 'with query date in the begining of the month', async ()=>{
			let db = new Database();
			let bookings: Booking[] = await db.getMonthBookings( 1, '2019-08-01' );

			expect( bookings.length ).toBe( 4 );
			expect( bookings[0].restautant.id ).toBe( 1 );
		});

		it( 'with query date in the end of the month', async ()=>{
			let db = new Database();
			let bookings: Booking[] = await db.getMonthBookings( 1, '2019-08-31' );

			expect( bookings.length ).toBe( 4 );
			expect( bookings[0].restautant.id ).toBe( 1 );
		});

		it( 'but NOT with query date out of the end of the month', async ()=>{
			let db = new Database();
			let bookings: Booking[] = await db.getMonthBookings( 1, '2019-09-31' );

			expect( bookings.length ).toBe( 1 );
			expect( bookings[0].restautant.id ).toBe( 1 );
		});

	});

	describe( 'Holiday tables', ()=>{
		it( 'shoud return a holiday object if have holiday', async ()=>{
			let db = new Database();
			let holiday = await db.getGuideHolidays( 1, '2017-08-04' );
			expect( holiday.length ).toBe( 1 );

		})
		it( 'shoud return a holiday object if NOT have holiday', async ()=>{
			let db = new Database();
			let holiday = await db.getGuideHolidays( 1, '2017-08-05' );
			console.log( '~~~~~~~~', holiday );
			expect( holiday.length ).toBe( 0 );

		})
	})

});
