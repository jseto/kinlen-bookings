import * as fetchMock from 'fetch-mock';
import * as mockData from './mock-data/db.js';
import { Database } from "../src/database";
import { Booking } from "../src/guide-booking";

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
    describe( 'avail_map for restaurantId 1',()=>{
      it( 'Should return GuideBookings for the month', ()=>{
        var bookings = mockData().avail_map( '2018-09-25', 1 );
        expect( bookings.length ).toBe( bookingsCount );
      });
    })
  });
});

describe( 'Database', function() {

  it( 'Should return a GuideBooking', async ()=> {
    fetchMock.mock('/wp-json/kinlen/guide_booking/?date=2018-09-25','[{"id":"3","date":"2018-09-25","time":"19:00:00","time_length":"3600","restaurant_booking_id":"-1","guide_id":"1","booked_seats":"2"}]')

    let db = new Database();
    let guideBooking: Booking = await db.getGuideBooking( '2018-09-25' );

    expect( guideBooking.date ).toEqual( '2018-09-25' );
    expect( guideBooking.time ).toEqual( "19:00:00" );
    expect( guideBooking.timeLength ).toBe( 3600 );
  });

  it( 'Should return an availability map', async ()=> {
    fetchMock.mock('/wp-json/kinlen/avail_map/?date=2018-09-25&restaurant_booking_id=1', JSON.stringify( mockData().avail_map( '2018-09-25', 1 ) ) );

    let db = new Database();
    let guideBookings: Booking[] = await db.getAvailabilityMap( 1, '2018-09-25' );

    expect( guideBookings.length ).toBe( bookingsCount );
  });

});
