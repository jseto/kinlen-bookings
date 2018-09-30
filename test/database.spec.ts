import * as fetchMock from 'fetch-mock';
import * as mockData from './mock-data/db.js';
import { Database } from "../src/database";
import { Booking } from "../src/booking";

describe( '\nDatabase helpers', ()=>{
  describe( '\nobjectToQueryString method:', ()=>{
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
	it( 'should return all elements from endpoint when no url parameter',()=>{
		let resp = mockData( '/wp-json/kinlen/mock_data_test_data/' );
		expect( resp.length ).toBe( 2 );
	})
	it( 'Should return one element when querying id', ()=>{
		let resp = mockData( '/wp-json/kinlen/mock_data_test_data/?id=1' );
		expect( resp.length ).toBe( 1 );
		expect( resp[0].name ).toEqual( 'Pankaj' );
	});
	it( 'Should return one element when querying id 2 parameters', ()=>{
		let resp = mockData( '/wp-json/kinlen/mock_data_test_data/?id=2&name=David' );
		expect( resp.length ).toBe( 1 );
		expect( resp[0].salary ).toEqual( '5000' );
	});
});


describe( 'Database', function() {

	fetchMock.mock('*', mockData );

  it( 'should return a Booking by id', async ()=> {
    let db = new Database();
    let booking: Booking = await db.getBooking( 3 );

    expect( booking.date ).toEqual( '2018-09-25' );
    expect( booking.time ).toEqual( "21:00:00" );
    expect( booking.timeLength ).toBe( 3000 );
  });

  it( 'should return all bookings for matching the queryObject', async ()=> {
    let db = new Database();
    let bookings: Booking[] = await db.getBookings( { restaurant_booking_id:1, date:'2018-09-25' } );

    expect( bookings.length ).toBe( 3 );
  });

	describe( 'getMonthBookings should report all bookings for the restaurant in a natural month', ()=>{

		it( 'with query date in the middle of the month', async ()=>{
			let db = new Database();
			let bookings: Booking[] = await db.getMonthBookings( 1, '2019-08-25' );

			expect( bookings.length ).toBe( 4 );
			expect( bookings[0].restautantBooking.id ).toBe( 1 );
		});

		it( 'with query date in the begining of the month', async ()=>{
			let db = new Database();
			let bookings: Booking[] = await db.getMonthBookings( 1, '2019-08-01' );

			expect( bookings.length ).toBe( 4 );
			expect( bookings[0].restautantBooking.id ).toBe( 1 );
		});

		it( 'with query date in the end of the month', async ()=>{
			let db = new Database();
			let bookings: Booking[] = await db.getMonthBookings( 1, '2019-08-31' );

			expect( bookings.length ).toBe( 4 );
			expect( bookings[0].restautantBooking.id ).toBe( 1 );
		});

		it( 'with query date in the end of the month', async ()=>{
			let db = new Database();
			let bookings: Booking[] = await db.getMonthBookings( 1, '2019-08-31' );

			expect( bookings.length ).toBe( 4 );
			expect( bookings[0].restautantBooking.id ).toBe( 1 );
		});

		it( 'but NOT with query date out of the end of the month', async ()=>{
			let db = new Database();
			let bookings: Booking[] = await db.getMonthBookings( 1, '2019-09-31' );

			expect( bookings.length ).toBe( 1 );
			expect( bookings[0].restautantBooking.id ).toBe( 1 );
		});

	})

});
