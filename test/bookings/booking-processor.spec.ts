import * as fetchMock from 'fetch-mock';
import { MockData } from './../mock-data/db-sql';
import { BookingProcessor, RawBooking } from '../../src/bookings/booking-processor';
import { Coupon } from '../../src/bookings/coupon';
import { BookingError } from '../../src/bookings/BookingError';
import { Booking } from '../../src/bookings/booking';

describe( 'The BookingProcessor is in charge of place a booking in the System', ()=> {
	let booking: RawBooking;
	let mockData: MockData;

	beforeAll(()=>{
	});

	beforeEach(()=>{
		mockData = new MockData();
		fetchMock.mock('*', ( url, opts )=>{ return mockData.response( url, opts ) } );
		booking = {
			restaurant_id: 1,
			date: new Date( '2018-10-10' ),
			time: '19:00:00',
			adults: 4,
			children: 2,
			coupon: '',
			name: 'Pepito Grillo',
			email: 'p.grillo@gmail.com',
			comment: 'no special requirements',
		};
	});

	afterEach(()=>{
		fetchMock.restore();
		mockData.close();
	});

	describe( 'the booking', ()=>{

		it( 'should accept a booking that can be placed', async ()=> {
			//booking.date = new Date( '2018-10-10' );
			let processor = new BookingProcessor( booking );
			expect( await processor.validateBooking() ).toBeTruthy()
		});

		it( 'should reject a booking that cannot be placed', async()=> {
			booking.date = new Date( '2018-10-05' );
			let processor = new BookingProcessor( booking );
			expect( await processor.validateBooking() ).toBeFalsy();
		});

		it( 'should fill booking data', async ()=>{
			let processor = new BookingProcessor( booking );
			let fullBooking = await processor.booking();

			expect( fullBooking.date ).toEqual( new Date( '2018-10-10' ) );
			expect( fullBooking.time ).toEqual( '19:00:00' );
			expect( fullBooking.comment ).toEqual( 'no special requirements' );
			expect( fullBooking.restaurant ).toBe( 1 );
			expect( fullBooking.adults ).toBe( 4 );
			expect( fullBooking.children ).toBe( 2 );
			expect( fullBooking.coupon ).toEqual( '' );
			expect( fullBooking.adultPrice ).toBe( 2000 );
			expect( fullBooking.childrenPrice ).toBe( 1000 );
			expect( fullBooking.couponValue ).toBe( 0 );
			expect( fullBooking.name ).toBe( 'Pepito Grillo' );
			expect( fullBooking.email ).toBe( 'p.grillo@gmail.com' );
		});

	});

	describe( 'the payment process', ()=> {

		it( 'should calculate the total amount', async ()=> {
			let processor = new BookingProcessor( booking );
			expect( await processor.totalToPay() ).toBe( 10000 );
			booking.adults = 2;
			booking.children = 4;
			processor = new BookingProcessor( booking );
			expect( await processor.totalToPay() ).toBe( 8000 );
		});

		describe( 'Coupon', ()=>{

			it( 'should validate an empty coupon', async ()=>{
				let processor = new BookingProcessor( booking );
				expect( await processor.isCouponValid() ).toBeTruthy();
			});

			it( 'should not validate a non existing coupon', async ()=>{
				booking.coupon = "NON_EXISTING";
				let processor = new BookingProcessor( booking );
				expect( await processor.isCouponValid() ).toBeFalsy();
			});

			it( 'should validate a non expire coupon', async ()=> {
				booking.coupon = "XXAAXX";
				let processor = new BookingProcessor( booking );
				expect( await processor.isCouponValid() ).toBeTruthy();
			});

			it( 'should not validate an expired coupon', async ()=> {
				booking.coupon = "EXPIRED";
				let coupon: Coupon = await BookingProcessor.getCoupon( booking.coupon );
				expect( coupon.id ).toBe( 2 )
				let processor = new BookingProcessor( booking );
				expect( await processor.isCouponValid() ).toBeFalsy();
			});

			it( 'should validate a non expired coupon', async ()=> {
				booking.coupon = "NON_EXPIRED";
				let processor = new BookingProcessor( booking );
				expect( await processor.isCouponValid() ).toBeTruthy();
			});

			it( 'should discount coupon in any letter case for a valid coupon', async ()=> {
				booking.coupon = "xxAaxX";
				let processor = new BookingProcessor( booking );
				expect( await processor.totalToPay() ).toBe( 9800 );
			});

			describe( 'around today', ()=>{
				let realDateNow: () => number;

				beforeAll(()=>{
					realDateNow = Date.now.bind(global.Date);
					const mockedNow = new Date( '2000-01-01' );
				  global.Date.now = jest.fn( () => mockedNow );
				});

				afterAll(()=>{
					global.Date.now = realDateNow;
					jest.clearAllMocks();
				});

				it( 'should fake today', async ()=> {
					let fakeToday = Date.now();
					expect( fakeToday ).toEqual( new Date( '2000-01-01' ) );
				});

				it( 'should validate an expire today coupon', async ()=> {
					booking.coupon = "EXPIRED";
					let processor = new BookingProcessor( booking );
					expect( await processor.isCouponValid() ).toBeTruthy();
				});

				it( 'should NOT validate an expire yesterday coupon', async ()=> {
					booking.coupon = "EXPIRED_YESTERDAY";
					let processor = new BookingProcessor( booking );
					expect( await processor.isCouponValid() ).toBeFalsy();
				});

				it( 'should validate an expire tomorrow coupon', async ()=> {
					booking.coupon = "EXPIRES_TOMORROW";
					let processor = new BookingProcessor( booking );
					expect( await processor.isCouponValid() ).toBeTruthy();
				});

			});

			it( 'should discount coupon value for a valid coupon', async ()=> {
				booking.coupon = "XXAAXX";
				let processor = new BookingProcessor( booking );
				expect( await processor.totalToPay() ).toBe( 9800 );
			});

			it( 'should NOT discount when NOT a valid coupon', async ()=> {
				booking.coupon = "SDFGJKL";
				let processor = new BookingProcessor( booking );
				expect( await processor.totalToPay() ).toBe( 10000 );
			});

			it( 'should NOT discount when expired coupon', async ()=> {
				booking.coupon = "EXPIRED";
				let processor = new BookingProcessor( booking );
				expect( await processor.totalToPay() ).toBe( 10000 );
			});

		});

		describe( 'on user press paypal button', ()=> {
			let processor: BookingProcessor;
			let tempBooking: Booking;

			it( 'should insert a temporary booking', async ()=>{
				processor = new BookingProcessor( booking );
				expect( await processor.validateBooking( true ) ).toBeTruthy();
				await processor.insertTempBooking();
				let b = await processor.booking();
				expect( b.id ).toBeGreaterThan( 0 );
			});

			it( 'should fill assignedGuide field', async ()=>{
				processor = new BookingProcessor( booking );
				expect( await processor.validateBooking( true ) ).toBeTruthy();
				tempBooking = await processor.insertTempBooking();
				expect( tempBooking.assignedGuide ).toBeTruthy();
				expect( tempBooking.paid ).toBeFalsy();
				expect( tempBooking.paidAmount ).toBe( 0 );
			})
		});

		xit( 'should accept booking on a fulfilled payment', ()=> {

		});

		xit( 'should reject booking in any other case', ()=> {

		});

		describe( 'on reject booking', ()=> {

			xit( 'should be stored in cancelled table for future reference', ()=>{

			});

			describe( 'a message with the reason', ()=> {

				async function process( processor: BookingProcessor ) {
					let error: BookingError;
					try {
						await processor.validateBooking( true );
					}
					catch( e ) {
						error = e;
					}
					return error;
				}

				it( 'should notify about booking slot already booked', async ()=> {
					booking.date = new Date( '2018-10-05' );
					let error = await process( new BookingProcessor( booking ) );
					expect( error ).toEqual( new BookingError( 'BOOKING_NOT_AVAILABLE' ) );
				});

				it( 'should notify about coupon not valid', async ()=> {
					booking.coupon = 'pirate';
					let error = await process( new BookingProcessor( booking ) );
					expect( error ).toEqual( new BookingError( 'INVALID_COUPON' ) );
				});

				xit( 'should notify about payment not fulfilled', ()=> {

				});

				xit( 'should notify about failure on inseting booking in database', ()=> {

				});

			});

		});

	});

});
