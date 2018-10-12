import * as fetchMock from 'fetch-mock';
import { MockData } from './mock-data/db-sql';
import { BookingMapper } from "../src/booking-mapper";
import { Database } from "../src/database";

let mapper = new BookingMapper( 1 );
let db = new Database();

describe( 'BookingMapper is a class providing the following services:', ()=> {
	let mockData: MockData;

	beforeEach(()=>{
		mockData = new MockData();
		fetchMock.mock('*', ( url, opts )=>{ return mockData.response( url, opts ) } );
	});

	afterEach(()=>{
		fetchMock.restore();
		mockData.close();
	});

	describe( 'a booking map where month days are the indexes of the array.', ()=> {

		describe( 'the booking map has to be cached for eficiency',()=>{

			it( 'should to be built on the first call', async()=>{
				let cacheSpy = spyOn( mapper, 'buildBookingMapCache' ).and.callThrough();
				await mapper.bookingSummary( '2010-09-02', '19:00:00' );
				expect( mapper.buildBookingMapCache ).toHaveBeenCalled();
				cacheSpy.calls.reset();
			// });
			// it( 'should not to be built rebuilt on same month calls', async()=>{
				await mapper.bookingSummary( '2010-09-12', '19:00:00' );
				expect( mapper.buildBookingMapCache ).not.toHaveBeenCalled();
				cacheSpy.calls.reset();
			// });
			// it( 'should to be rebuilt on different month call', async()=>{
				await mapper.bookingSummary( '2010-02-02', '19:00:00' );
				expect( mapper.buildBookingMapCache ).toHaveBeenCalled();
				cacheSpy.calls.reset();
			})
		});

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

	describe( 'a function reporting that a slot is available when there is a free guide and restaurant is open', ()=> {

		describe( 'there is a free guide when a guide is assigned to this restaurant and still have seats available OR there is an available guide:', ()=> {

			xdescribe( 'when a guide is assigned to this restaurant and still have seats available', ()=> {

				it( 'should have this guide assigned to this restaurant in this slot', ()=> {

				});

				it( 'should have seats available', ()=> {

				});

				it( 'should happen both of the above conditions', ()=> {

				});

			});

			describe( 'when guide is available for the day', ()=> {

				it( 'should not have bookings for the day', async()=> {
					let guide = await mapper.availableGuide( '2001-05-01' );
					let guideBookings = await db.getBookings({
						guide_id: guide.id,
						date: '2001-05-01'
					});
					expect( guide.id ).toBe( 4 );
					expect( guideBookings.length ).toBe( 0 );
				});

				it( 'should not be blocked (holiday, etc.) for the booking day', async ()=> {
					let guide1 = await mapper.availableGuide( '2001-05-01' );
					await db.blockGuide( guide1.id, '2001-05-01' );
					let guide2 = await mapper.availableGuide( '2001-05-01' );
					expect( guide1.id ).not.toEqual( guide2.id );
				});

				it( 'should verify both of the above conditions; no booking and no holiday for the day', ()=> {

				});

			});

		});

		xdescribe( 'the restaurant open that day', ()=> {

			it( 'should not be blocked for the booking day', ()=> {

			});

		});

		it( 'should verify both of the above conditions; a free guide and the restaurant is open', ()=> {

		});

	});

});
