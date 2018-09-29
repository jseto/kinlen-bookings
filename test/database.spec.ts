import * as fetchMock from 'fetch-mock';
import * as mockData from './mock-data/db.js';
import { Database } from "../src/database";
import { Booking } from "../src/booking";

const bookingsCount = 4;

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
		it( 'should return elements from endpoint when no url parameter',()=>{
			let resp = mockData( '/wp-json/kinlen/mock_data_test_data/' );
			expect( resp.length ).toBe( 2 );
		})
    describe( 'avail_map for restaurantId 1',()=>{
      it( 'Should return one element when querying id', ()=>{
				let resp = mockData( '/wp-json/kinlen/mock_data_test_data/?id=2' );
        expect( resp.length ).toBe( 1 );
      });
    })
  });
});

describe( 'Database', function() {

  it( 'Should return a Booking by id', async ()=> {
  	fetchMock.mock('/wp-json/kinlen/guide_booking/?id=3','[{"id":"3","date":"2018-09-25","time":"19:00:00","time_length":"3600","restaurant_booking_id":"-1","guide_id":"1","booked_seats":"2"}]')
    let db = new Database();
    let booking: Booking = await db.getBooking( 3 );

    expect( booking.date ).toEqual( '2018-09-25' );
    expect( booking.time ).toEqual( "19:00:00" );
    expect( booking.timeLength ).toBe( 3600 );
  });

  xit( 'Should return an availability map', async ()=> {
    fetchMock.mock('/wp-json/kinlen/avail_map/?date=2018-09-25&restaurant_booking_id=1', mockData );

    let db = new Database();
    let guideBookings: Booking[] = await db.getAvailabilityMap( 1, '2018-09-25' );

    expect( guideBookings.length ).toBe( bookingsCount );
  });

});
