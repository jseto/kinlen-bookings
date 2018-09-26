import { Database } from "../src/database";
import {GuideBooking} from "../src/guide-booking";

describe( 'Database', function() {

  beforeEach(function() {
    jasmine.Ajax.install();
    jasmine.Ajax.stubRequest( '/wp-json/kinlen/guide_booking/?date=2018-9-25' ).andReturn({
      status: 200,
      responseText: '[{"id":"3","date":"2018-09-25","time":"19:00:00","time_length":"0","restaurant_booking_id":"-1","guide_id":"1","booked_seats":"2"}]'
    });
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it( 'Should return a GuideBooking', async function() {

    let db = new Database();
    let guideBooking: GuideBooking = await db.getGuideBooking( '2018-9-25' );

    expect( jasmine.Ajax.requests.mostRecent().url ).toBe( '/wp-json/kinlen/guide_booking/?date=2018-9-25' );
    expect( guideBooking.getId() ).toBe( 3 );
  });

  it( 'Should return an availability', function() {

  });

});
