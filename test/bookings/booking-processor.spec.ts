import * as fetchMock from 'fetch-mock';
import { MockData } from './../mock-data/db-sql';
import { BookingProcessor } from '../../src/bookings/booking-processor';
import { Coupon } from '../../src/bookings/coupon';
import { Booking } from '../../src/bookings/booking';

describe( 'The BookingProcessor is in charge of place a booking in the System', ()=> {
	let booking: Booking;

	beforeAll(()=>{
		let mockData = new MockData();
		fetchMock.mock('*', ( url, opts )=>{ return mockData.response( url, opts ) } );
	});

	beforeEach(()=>{
		booking = new Booking(-1);
		booking.fromObject({
			restaurant_id: 1,
			date: new Date( '2018-10-10' ),
			time: '19:00:00',
			adults: 4,
			children: 2,
			coupon: '',
			name: 'Pepito Grillo',
			email: 'p.grillo@gmail.com',
			comment: 'no special requirements',
		});
	});

	describe( 'the booking', ()=>{

		it( 'should accept a booking that can be placed', async ()=> {
			booking.setDate( new Date( '2018-10-10' ) );
			let processor = new BookingProcessor( booking );
			expect( await processor.validateBooking() ).toBeTruthy()
		});

		it( 'should reject a booking that cannot be placed', async()=> {
			booking.setDate( new Date( '2018-10-05' ) );
			let processor = new BookingProcessor( booking );
			expect( await processor.validateBooking() ).toBeFalsy()
		});

		it( 'should fill booking data', async ()=>{
			let processor = new BookingProcessor( booking );
			booking = await processor.prepareBooking();

			expect( booking.date ).toEqual( new Date( '2018-10-10' ) );
			expect( booking.time ).toEqual( '19:00:00' );
			expect( booking.comment ).toEqual( 'no special requirements' );
			expect( booking.restaurant ).toBe( 1 );
			expect( booking.adults ).toBe( 4 );
			expect( booking.children ).toBe( 2 );
			expect( booking.coupon ).toEqual( '' );
			expect( booking.adultPrice ).toBe( 2000 );
			expect( booking.childrenPrice ).toBe( 1000 );
			expect( booking.couponValue ).toBe( 0 );
			expect( booking.name ).toBe( 'Pepito Grillo' );
			expect( booking.email ).toBe( 'p.grillo@gmail.com' );
		});

	});

	describe( 'the payment process', ()=> {

		it( 'should calculate the total amount', async ()=> {
			let processor = new BookingProcessor( booking );
			expect( await processor.totalToPay() ).toBe( 10000 );
			booking.setAdults( 2 );
			booking.setChildren( 4 );
			processor = new BookingProcessor( booking );
			expect( await processor.totalToPay() ).toBe( 8000 );
		});

		describe( 'Coupon', ()=>{

			it( 'should not validate an empty coupon', async ()=>{
				let processor = new BookingProcessor( booking );
				expect( await processor.isCouponValid() ).toBeFalsy();
			});

			it( 'should not validate a non existing coupon', async ()=>{
				booking.setCoupon( "NON_EXISTING" );
				let processor = new BookingProcessor( booking );
				expect( await processor.isCouponValid() ).toBeFalsy();
			});

			it( 'should validate a non expire coupon', async ()=> {
				booking.setCoupon( "XXAAXX" );
				let processor = new BookingProcessor( booking );
				expect( await processor.isCouponValid() ).toBeTruthy();
			});

			it( 'should not validate an expired coupon', async ()=> {
				booking.setCoupon( "EXPIRED" );
				let coupon: Coupon = await BookingProcessor.getCoupon( booking.coupon );
				expect( coupon.id ).toBe( 2 )
				let processor = new BookingProcessor( booking );
				expect( await processor.isCouponValid() ).toBeFalsy();
			});

			it( 'should validate a non expired coupon', async ()=> {
				booking.setCoupon( "NON_EXPIRED" );
				let processor = new BookingProcessor( booking );
				expect( await processor.isCouponValid() ).toBeTruthy();
			});

			it( 'should discount coupon in any letter case for a valid coupon', async ()=> {
				booking.setCoupon( "xxAaxX" );
				let processor = new BookingProcessor( booking );
				expect( await processor.totalToPay() ).toBe( 9800 );
			});

			describe( 'around today', ()=>{
				let realDateNow;

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
					booking.setCoupon( "EXPIRED" );
					let processor = new BookingProcessor( booking );
					expect( await processor.isCouponValid() ).toBeTruthy();
				});

				it( 'should NOT validate an expire yesterday coupon', async ()=> {
					booking.setCoupon( "EXPIRED_YESTERDAY" );
					let processor = new BookingProcessor( booking );
					expect( await processor.isCouponValid() ).toBeFalsy();
				});

				it( 'should validate an expire tomorrow coupon', async ()=> {
					booking.setCoupon( "EXPIRES_TOMORROW" );
					let processor = new BookingProcessor( booking );
					expect( await processor.isCouponValid() ).toBeTruthy();
				});

			});

			it( 'should discount coupon value for a valid coupon', async ()=> {
				booking.setCoupon( "XXAAXX" );
				let processor = new BookingProcessor( booking );
				expect( await processor.totalToPay() ).toBe( 9800 );
			});

			it( 'should NOT discount when NOT a valid coupon', async ()=> {
				booking.setCoupon( "SDFGJKL" );
				let processor = new BookingProcessor( booking );
				expect( await processor.totalToPay() ).toBe( 10000 );
			});

			it( 'should NOT discount when expired coupon', async ()=> {
				booking.setCoupon( "EXPIRED" );
				let processor = new BookingProcessor( booking );
				expect( await processor.totalToPay() ).toBe( 10000 );
			});

		});

		describe( 'collects financial data', async ()=> {
			xit( 'prepares a paypal payment object', ()=>{
				let processor = new BookingProcessor( booking );
				expect(0).toBe(1)
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
				xit( 'should notify about booking slot already booked', ()=> {

				});

				xit( 'should notify about coupon not valid', ()=> {

				});

				xit( 'should notify about payment not fulfilled', ()=> {

				});

				xit( 'should notify about failure on inseting booking in database', ()=> {

				});

			});

		});

	});

});
