import * as fetchMock from 'fetch-mock';
import { MockData } from './../mock-data/db-sql';
import { BookingProcessor, BookingData } from '../../src/bookings/booking-processor';
import { Coupon } from '../../src/bookings/coupon';

describe( 'The BookingProcessor is in charge of place a booking in the System', ()=> {
	let bookingData: BookingData;

	beforeAll(()=>{
		let mockData = new MockData();
		fetchMock.mock('*', ( url, opts )=>{ return mockData.response( url, opts ) } );
	});

	beforeEach(()=>{
		bookingData = {
			restaurant_id: 1,
			date: new Date( '2018-10-10' ),
			time: '19:00:00',
			adults: 4,
			children: 2,
			coupon: '',
			name: 'pepito grillo',
			email: 'p.grillo@gmail.com',
			comment: 'no special requirements',
		}
	});

	describe( 'the booking', ()=>{

		it( 'should accept a booking that can be placed', async ()=> {
			bookingData.date = new Date( '2018-10-10' );
			let processor = new BookingProcessor( bookingData );
			expect( await processor.validateBooking() ).toBeTruthy()
		});

		it( 'should reject a booking that cannot be placed', async()=> {
			bookingData.date = new Date( '2018-10-05' );
			let processor = new BookingProcessor( bookingData );
			expect( await processor.validateBooking() ).toBeFalsy()
		});

		it( 'should fill booking data', async ()=>{
			let processor = new BookingProcessor( bookingData );
			let booking = await processor.prepareBooking();

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
		});

	});

	describe( 'the payment process', ()=> {

		it( 'should calculate the total amount', async ()=> {
			let processor = new BookingProcessor( bookingData );
			expect( await processor.totalToPay() ).toBe( 10000 );
			bookingData.adults = 2;
			bookingData.children = 4;
			processor = new BookingProcessor( bookingData );
			expect( await processor.totalToPay() ).toBe( 8000 );
		});

		describe( 'Coupon', ()=>{

			it( 'should not validate an empty coupon', async ()=>{
				let processor = new BookingProcessor( bookingData );
				expect( await processor.isCouponValid() ).toBeFalsy();
			});

			it( 'should not validate a non existing coupon', async ()=>{
				bookingData.coupon = "NON_EXISTING";
				let processor = new BookingProcessor( bookingData );
				expect( await processor.isCouponValid() ).toBeFalsy();
			});

			it( 'should validate a non expire coupon', async ()=> {
				bookingData.coupon = "XXAAXX";
				let processor = new BookingProcessor( bookingData );
				expect( await processor.isCouponValid() ).toBeTruthy();
			});

			it( 'should not validate an expired coupon', async ()=> {
				bookingData.coupon = "EXPIRED";
				let coupon: Coupon = await BookingProcessor.getCoupon( bookingData.coupon );
				expect( coupon.id ).toBe( 2 )
				let processor = new BookingProcessor( bookingData );
				expect( await processor.isCouponValid() ).toBeFalsy();
			});

			it( 'should validate a non expired coupon', async ()=> {
				bookingData.coupon = "NON_EXPIRED";
				let processor = new BookingProcessor( bookingData );
				expect( await processor.isCouponValid() ).toBeTruthy();
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
					bookingData.coupon = "EXPIRED";
					let processor = new BookingProcessor( bookingData );
					expect( await processor.isCouponValid() ).toBeTruthy();
				});

				it( 'should NOT validate an expire yesterday coupon', async ()=> {
					bookingData.coupon = "EXPIRED_YESTERDAY";
					let processor = new BookingProcessor( bookingData );
					expect( await processor.isCouponValid() ).toBeFalsy();
				});

				it( 'should validate an expire tomorrow coupon', async ()=> {
					bookingData.coupon = "EXPIRES_TOMORROW";
					let processor = new BookingProcessor( bookingData );
					expect( await processor.isCouponValid() ).toBeTruthy();
				});

			});

			xit( 'should discount coupon value for a valid coupon', async ()=> {
				bookingData.coupon = "XXAAXX";
				let processor = new BookingProcessor( bookingData );
				expect( await processor.totalToPay() ).toBe( 9800 );
			});

			xit( 'should discount coupon in any letter case for a valid coupon', async ()=> {
				bookingData.coupon = "xxaaxx";
				let processor = new BookingProcessor( bookingData );
				expect( await processor.totalToPay() ).toBe( 9800 );
			});

			xit( 'should NOT discount when NOT a valid coupon', async ()=> {

			});

			xit( 'should NOT discount when expired coupon', async ()=> {

			});

		});

		xit( 'should collect financial data', async ()=> {

		});

		xit( 'should accept booking on a fulfilled payment', ()=> {

		});

		xit( 'should reject booking in any other case', ()=> {

		});

		describe( 'on reject booking a message with the reason', ()=> {
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
