import {BookingMapper} from "../src/booking-mapper";

describe( 'Booking system', function() {
	let bookings = new BookingMapper(1);

  describe( 'when require free slots', function() {

    it( 'should return a map of the free slots for the month', function() {

    });

    describe( 'Free slot for a restaurant is when have free guide and restaurant is open', function() {

      describe( 'Restaurant have free guide', function() {

        describe( 'Free guide is when one of the below conditions happens', function() {

          describe( 'when guide is assigned to this restaurant and still have seats available', function() {

            it( 'Guide is assigned to this restaurant', function() {

            });

            it( 'Guide have seats available', function() {

            });

            it( 'Both of the above conditions happen', function() {

            });

          });

          it( 'when guide is not assigned to any restaurant for the day', function() {

          });

          it( 'One of the above conditions happen', function() {

          });

        });

      });

      it( 'Restaurant open that day', function() {

      });

      it( 'Both of the above conditions happen', function() {

      });

    });

  });

});
