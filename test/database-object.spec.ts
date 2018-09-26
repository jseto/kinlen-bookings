import { GuideBooking } from "../src/guide-booking";
import { RestaurantBooking } from "../src/restaurant-booking";
import { Guide } from "../src/guide";

describe( 'DatabaseObject', function() {

  it( 'toObject method should work for every descendant', ()=> {
    let guideBooking = new GuideBooking(3)
                              .setDate('2018-05-23')
                              .setTime( "19:00:00" )
                              .setTimeLength( 1800 )
                              .setBookedSeats( 5 )
                              .setAssignedGuide( new Guide( 2 ) )
                              .setRestaurantBooking( new RestaurantBooking( 34 ) )
    let obj = guideBooking.toObject();
    expect( obj.id ).toBe( 3 );
    expect( obj.date ).toEqual( '2018-05-23' );
    expect( obj.time ).toEqual( "19:00:00" );
    expect( obj.booked_seats ).toBe( 5 );
    expect( obj.time_length ).toBe( 1800 );
    expect( obj.assigned_guide.id ).toBe( 2 );
    expect( obj.restautant_booking.id ).toBe( 34 );
  });

});
