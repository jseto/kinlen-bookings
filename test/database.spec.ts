import { Database } from "../src/database";

describe( 'Database', function() {

  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it( 'Should return a GuideBooking', async function() {
    jasmine.Ajax.stubRequest( '/wp-json/kinlen/guide_booking/?date=2018-9-25' ).andReturn({
      "status": 200,
      "contentType": 'application/json; charset=UTF-8',
      "response": 'immediate response'
    });

    let db = new Database();
    let guideBooking = await db.getGuideBooking( '2018-9-25' );

    expect( jasmine.Ajax.requests.mostRecent().url ).toBe( '/wp-json/kinlen/guide_booking/?date=2018-9-25' );
    expect( guideBooking.getDate() ).toBe( '2018-9-25' );
  });

  // it( 'Should return a GuideBooking', async function() {
  //   jasmine.Ajax.stubRequest( 'https://best-thai-food.com/wp-json/kinlen/guide_booking/?date=2018-9-25' ).andReturn({
  //     "responseText":'immediate response'
  //   });
  //
  //   jQuery.getJSON('/wp-json/kinlen/guide_booking/');
  //   let db = new Database();
  //   let guideBooking = await db.getGuideBooking( '2018-9-25' ).then( ( data ) => {
  //   });
  //
  //   expect( jasmine.Ajax.requests.mostRecent().url ).toBe( 'https://best-thai-food.com/wp-json/kinlen/guide_booking/?date=2018-9-25' );
  //   expect( guideBooking.getDate() ).toBe( '2018-9-25' );
  // });



  it( 'Should return an availability', function() {

  });

});
