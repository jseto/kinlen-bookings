import { Booking } from "../../src/bookings/booking";
import { Guide } from "../../src/bookings/guide";
import { Restaurant } from "../../src/bookings/restaurant";

describe( 'DatabaseObject', function() {

  it( 'toObject method should work for every descendant', ()=> {
    let booking = new Booking(3)
                              .setDate( new Date( '2018-05-23' ) )
                              .setTime( "19:00:00" )
                              .setTimeLength( 1800 )
                              .setBookedSeats( 5 )
                              .setAssignedGuide( new Guide( 2 ) )
                              .setRestaurant( new Restaurant( 34 ) )
    let obj = booking.toObject();
    expect( obj.id ).toBe( 3 );
    expect( obj.date ).toEqual( '2018-05-23' );
    expect( obj.time ).toEqual( "19:00:00" );
    expect( obj.booked_seats ).toBe( 5 );
    expect( obj.time_length ).toBe( 1800 );
    expect( obj.assigned_guide.id ).toBe( 2 );
    expect( obj.restautant.id ).toBe( 34 );
  });

});
