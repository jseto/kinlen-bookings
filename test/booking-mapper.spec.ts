import * as fetchMock from 'fetch-mock';
import { MockData } from './mock-data/db-sql';
import { BookingMapper } from "../src/booking-mapper";
import { Database } from "../src/database";
import { MAX_SEATS_PER_GUIDE } from '../src/guide';

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

	describe( 'a function reporting how many seats are available for a slot (when there is a free guide and restaurant is open)', ()=> {

		describe( 'there is a free guide when a guide is assigned to this restaurant and still have seats available OR there is an available guide:', ()=> {

			describe( 'when a guide is assigned to this restaurant and still have seats available', ()=> {
				let bookingDate = '2001-05-02';
				let bookingTime = '21:00:00';

				it( 'should have this guide assigned to this restaurant in this slot', async ()=> {
					let booking = await mapper.bookingSummary( bookingDate, bookingTime );
					expect( booking.guideId ).toBe( 1 );
				});

				it( 'should have seats available', async ()=> {
					let booking = await mapper.bookingSummary( bookingDate, bookingTime );
					expect( booking.bookedSeats ).toBeLessThan( MAX_SEATS_PER_GUIDE );
				});

				it( 'should happen both of the above conditions', async ()=> {
					let booking = await mapper.bookingSummary( bookingDate, bookingTime );
					let available = await mapper.availableSeats( bookingDate, bookingTime );
					expect( available ).toBe( MAX_SEATS_PER_GUIDE - booking.bookedSeats );
				});
			});

			describe( 'when guide is available for the day', ()=> {
				let bookingDate = '2001-05-01';

				it( 'should not have bookings for the day', async()=> {
					let guide = await mapper.availableGuide( bookingDate );
					let guideBookings = await db.getBookings({
						guide_id: guide.id,
						date: bookingDate
					});
					expect( guide.id ).toBe( 4 );
					expect( guideBookings.length ).toBe( 0 );
				});

				it( 'should not be blocked (holiday, etc.) for the booking day', async ()=> {
					let guide1 = await mapper.availableGuide( bookingDate );
					let holiday = await db.getGuideHolidays( guide1.id, bookingDate );
					expect( holiday.length ).toBe( 0 );

					await db.setGuideHoliday( guide1.id, bookingDate );
					let guide2 = await mapper.availableGuide( bookingDate );
					expect( guide1.id ).not.toEqual( guide2.id );
				});

				it( 'both conditions above should happen', async ()=>{
					let guide = await mapper.availableGuide( bookingDate );
					let bookings = await db.getBookings({
						guide_id: guide.id,
						date: bookingDate
					});
					let holidays = await db.getGuideHolidays( guide.id, bookingDate );
					expect( bookings.length ).toBe( 0 );
					expect( holidays.length ).toBe( 0 );
				});
			});
		});

		describe( 'the restaurant open that day', ()=> {
			describe( 'testing bloking of restaurant', ()=>{

				it( 'should report availavility if not a holiday', async ()=>{
					let seats = await mapper.availableSeats( '2001-05-03', '19:00:00' );
					expect( seats ).toBeTruthy();
				})

				it( 'should not report seats when blocked for the booking day', async ()=> {
					await db.setRestaurantHoliday( 1, '2001-06-04' );
					mapper.invalidateCache();
					let seats = await mapper.availableSeats( '2001-06-04', '19:00:00' );
					expect( seats ).toBe( 0 );
				});

				it( 'should not report seats when blocked for the booking day at any time', async ()=> {
					await db.setRestaurantHoliday( 1, '2001-06-04' );
					mapper.invalidateCache();
					let seats = await mapper.availableSeats( '2001-06-04', '21:00:00' );
					expect( seats ).toBe( 0 );
				});
			});
		});
	});
});
