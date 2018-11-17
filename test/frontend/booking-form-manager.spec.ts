import * as fetchMock from 'fetch-mock';
import { MockData } from './../mock-data/db-sql';
import * as fs from "fs";
import { setupBookingFormManager } from "../../src";
import { SimInput } from "../mocks/sim-input";

describe( 'BookingFormManager is in charge to manage the DOM form elements and their relationships', ()=> {
	let formManager;
	let dateField: any;

	beforeAll(async()=>{
		let mockData = new MockData();
		fetchMock.mock('*', ( url, opts )=>{ return mockData.response( url, opts ) } );
		let html = fs.readFileSync('test/frontend/mock-page.html', 'utf8');

		let postIdHtml = [
			'<div id="kl-post-id">																			',
			'	<div class="elementor-widget-container">																			',
			'		<div class="elementor-shortcode">																			',
			'			1																			',
			'		</div>																			',
			'	</div>																			',
			'</div>																			'
		];

		document.body.innerHTML = html + postIdHtml.join(' ');

		dateField = document.getElementById( 'form-field-kl-booking-date' );
		dateField['_flatpickr'] = { config:{} };
		formManager = await setupBookingFormManager();
	});

	describe( 'on startup', ()=> {

		it( 'should get restaurant id from kl-post-id <div>', ()=> {
			expect( formManager.restaurant ).toBe( 1 );
		});

		it( 'should configure calendar ', ()=> {
			expect( dateField._flatpickr.config.disableMobile ).toBeTruthy();
			expect( dateField._flatpickr.config.onMonthChange ).toBeDefined();
			expect( dateField._flatpickr.config.onOpen ).toBeDefined();
			expect( dateField._flatpickr.config.onChange ).toBeDefined();
		});

	});

	describe( 'on date set', ()=> {

		it( 'should set visibility of time options', async ()=> {
			await SimInput.setValue( dateField, '2018-10-05' )
			expect( SimInput.isRadioShown( 'form-field-kl-booking-time-0' ) ).toBeFalsy();
		});

		xit( 'should auto check a time option', ()=> {

		});

		xit( 'should set focus on name field', ()=> {

		});

	});

	describe( 'on time set', ()=> {

		xit( 'should set focus on name field', ()=> {

		});

	});

	describe( 'on adult select', ()=> {

		xit( 'should set max children in children select', ()=> {

		});

		xit( 'should reset date', ()=> {

		});

	});

	describe( 'on children select', ()=> {

		xit( 'should reset date', ()=> {

		});

	});

	describe( 'on submit button', ()=> {

		xit( 'should perform a booking', ()=> {

		});

	});

});
