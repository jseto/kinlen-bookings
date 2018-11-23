import * as fetchMock from 'fetch-mock';
import { MockData } from './../mock-data/db-sql';
import { BookingProcessor, BookingData } from '../../src/bookings/booking-processor';

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

		xit( 'should discount coupon value for a valid coupon', async ()=> {

		});

		xit( 'should NOT discount when NOT a valid coupon', async ()=> {

		});

		xit( 'should NOT discount when expired coupon', async ()=> {

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
