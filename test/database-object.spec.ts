import { GuideBooking } from "../src/guide-booking";
import { RestaurantBooking } from "../src/restaurant-booking";
import { TimeSlot } from "../src/time-slot";
import { Guide } from "../src/guide";

describe( 'DatabaseObject', function() {

  it( 'toObject method should work for every descendant', ()=> {
    let guideBooking = new GuideBooking(3)
                              .setDate('2018-05-23')
                              .setBookedSeats( 5 )
                              .setTimeSlot( new TimeSlot( "19:00", 1800 ) )
                              .setAssignedGuide( new Guide( 2 ) )
                              .setRestaurantBooking( new RestaurantBooking( 34 ) )
    let obj = guideBooking.toObject();
    expect( obj.id ).toBe( 3 );
    expect( obj.date ).toEqual( '2018-05-23' );
    expect( obj.booked_seats ).toBe( 5 );
    // expect( assigned_guide. ).
  });

});
