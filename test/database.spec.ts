import * as fetchMock from 'fetch-mock';
import * as mockData from './mock-data/db.js';
import { Database } from "../src/database";
import { Booking } from "../src/booking";

describe( 'Database helpers', ()=>{
  describe( 'objectToQueryString method', ()=>{
    it( 'Should work for unitary objects', ()=>{
      let db = new Database();
      let obj = {
        date: '2018-09-25'
      }
			let query = db.objectToQueryString( obj );
      expect( query ).toEqual( '?date=2018-09-25' );
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
});

describe( 'Database', function() {

  it( 'Should return a Booking by id', async ()=> {
  	fetchMock.mock('/wp-json/kinlen/booking/?id=3', mockData );
    let db = new Database();
    let booking: Booking = await db.getBooking( 3 );

    expect( booking.date ).toEqual( '2018-09-25' );
    expect( booking.time ).toEqual( "21:00:00" );
    expect( booking.timeLength ).toBe( 3000 );
  });

  it( 'Should return an availability map', async ()=> {
    fetchMock.mock('/wp-json/kinlen/booking/?date=2018-09-25&restaurant_booking_id=1', mockData );

    let db = new Database();
    let guideBookings: Booking[] = await db.getAvailabilityMap( 1, '2018-09-25' );

    expect( guideBookings.length ).toBe( 3 );
  });

});
