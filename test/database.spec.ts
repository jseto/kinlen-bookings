import * as fetchMock from 'fetch-mock';
import { Database } from "../src/database";
import { GuideBooking } from "../src/guide-booking";

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
});

describe( 'Database', function() {
  beforeAll( ()=>{
    fetchMock.mock('/wp-json/kinlen/guide_booking/?date=2018-9-25','[{"id":"3","date":"2018-09-25","time":"19:00:00","time_length":"3600","restaurant_booking_id":"-1","guide_id":"1","booked_seats":"2"}]');
  });

  it( 'Should return a GuideBooking', async function() {

    let db = new Database();
    let guideBooking: GuideBooking = await db.getGuideBooking( '2018-9-25' );

//    expect( guideBooking.id ).toBe( 3 );
    expect( guideBooking.date ).toEqual( '2018-09-25' );
    expect( guideBooking.time ).toEqual( "19:00:00" );
    expect( guideBooking.timeLength ).toBe( 3600 );
  });

  it( 'Should return an availability', function() {

  });

});
