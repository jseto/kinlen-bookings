import { Booking } from "../../src/bookings/booking";

describe( 'DatabaseObject', function() {

  it( 'toObject method should work for every descendant', ()=> {
    let booking = new Booking(3)
                              .setDate( new Date( '2018-05-23' ) )
                              .setTime( "19:00:00" )
                              .setTimeLength( 1800 )
                              .setAdults( 5 )
                              .setAssignedGuide( 2 )
                              .setRestaurant( 34 )
    let obj = booking.toObject();
    expect( obj.id ).toBe( 3 );
    expect( obj.date ).toEqual( '2018-05-23' );
    expect( obj.time ).toEqual( "19:00:00" );
    expect( obj.adults ).toBe( 5 );
    expect( obj.time_length ).toBe( 1800 );
    expect( obj.assigned_guide ).toBe( 2 );
    expect( obj.restautant ).toBe( 34 );
  });

});
