import { BookingMapper } from "../src/booking-mapper";

let mapper = new BookingMapper( 1 );

describe( 'BookingMapper is a class providing the following services:', ()=> {

	describe( 'a booking map where month days are the indexes of the array.', ()=> {

		describe( 'if there is no booking for the day', ()=> {

			it( 'should return falsy for no day booking', async ()=> {
				let booking = await mapper.bookingSummary( '2018-09-02', '19:00:00' );
				expect( booking ).toBeFalsy();
			});
			it( 'should return falsy for day booking but not in the time', async ()=> {
				let booking = await mapper.bookingSummary( '2018-09-25', '10:00:00' );
				expect( booking ).toBeFalsy();
			});

		});

		describe( 'if there are bookings for the day', ()=> {

			it( 'should return the booking for that day and time', async ()=> {
				let booking = await mapper.bookingSummary( '2018-09-25', '21:00:00' );
				expect( booking ).toBeTruthy();
				expect( booking.guideId ).toBe( 1 );
				expect( booking.bookedSeats ).toBe( 5 );
			});

		});

	});

	describe( 'a function to know about of availability.', ()=> {

		xit( 'should accept restaurant and date as parameters', ()=> {

		});

		xit( 'should accept optionally time', ()=> {

		});

		describe( 'reporting that a slot is available when:', ()=> {

			describe( 'there is a free guide whether one of the following conditions happen:', ()=> {

				describe( 'a guide is assigned to this restaurant and still have seats available', ()=> {

					xit( 'should have this guide assigned to this restaurant in this slot', ()=> {

					});

					xit( 'should have seats available', ()=> {

					});

					xit( 'should happen both of the above conditions', ()=> {

					});

				});

				describe( 'when guide is available for the day', ()=> {

					xit( 'should not have bookings for the day', ()=> {

					});

					xit( 'should not be blocked (holiday, etc.) for the booking day', ()=> {

					});

					xit( 'should verify both of the above conditions; no booking and no holiday for the day', ()=> {

					});

				});

			});

			describe( 'the restaurant open that day', ()=> {

				xit( 'should not be blocked for the booking day', ()=> {

				});

			});

			xit( 'should verify both of the above conditions; a free guide and the restaurant is open', ()=> {

			});

		});

	});

});
