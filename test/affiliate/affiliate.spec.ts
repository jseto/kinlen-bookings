import { Affiliate } from "../../src/affiliate/affiliate";
import { BookingProcessor, RawBooking } from "../../src/bookings/booking-processor";
import { MockData } from "../mock-data/db-sql";
import fetchMock = require("fetch-mock");

describe( 'Affiliate', ()=>{
	beforeEach(()=>{
		Object.defineProperty(window.document, 'cookie', {
        writable: true,
        value: 'myCookie=omnomnom',
    });
	});

	it( 'should set a cookie on afiliate page access', ()=>{
		Affiliate.set( new URL( 'http://dfdff.dfdf.dfdf/?affiliate_id=tuktuk29' ) );
		expect( window.document.cookie ).toContain( 'tuktuk29' );
	});

	it( 'shoul be able to get affiliate code', ()=>{
		Affiliate.set( new URL( 'http://dfdff.dfdf.dfdf/?affiliate_id=tuktuk29' ) );
		expect( Affiliate.get() ).toEqual( 'tuktuk29' );
	});

	it( 'should NOT set cookie if not affiliate page', ()=>{
		Affiliate.set( new URL( 'http://dfdff.dfdf.dfdf/?not_affiliate_id=tuktuk29' ) );
		expect( window.document.cookie ).not.toContain( 'tuktuk29' );
	});

	it( 'should get undefined if not affiliate page', ()=>{
		Affiliate.set( new URL( 'http://dfdff.dfdf.dfdf/not_affiliate?id=tuktuk29' ) );
		expect( Affiliate.get() ).toBeUndefined();
	});

	describe( 'Place a booking', ()=>{
		let booking: RawBooking;
		let mockData: MockData;

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

		it( 'shoul fill the field for affiliate if affiliate', async ()=>{
			Affiliate.set( new URL( 'http://dfdff.dfdf.dfdf/?affiliate_id=tuktuk29' ) );
			let bookingProcessor = new BookingProcessor( booking );
			let storedBooking = await bookingProcessor.insertTempBooking();
			expect( storedBooking.affiliateId ).toEqual( 'tuktuk29' );
		});

		it( 'shoul NOT fill the field for affiliate if NOT affiliate', async ()=>{
			Affiliate.set( new URL( 'http://dfdff.dfdf.dfdf/?not_affiliate_id=tuktuk29' ) );
			let bookingProcessor = new BookingProcessor( booking );
			let storedBooking = await bookingProcessor.insertTempBooking();
			expect( storedBooking.affiliateId ).toBeFalsy();
		});

	});
});
