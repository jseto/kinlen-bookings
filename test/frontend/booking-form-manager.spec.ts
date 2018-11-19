import * as fetchMock from 'fetch-mock';
import { MockData } from './../mock-data/db-sql';
import * as fs from "fs";
import { setupBookingFormManager } from "../../src";
import { SimInput } from "../mocks/sim-input";
import { MAX_SEATS_PER_GUIDE } from '../../src/bookings/guide';
import { BookingFormManager } from '../../src/frontend/booking-form-manager';

describe( 'BookingFormManager is in charge to manage the DOM form elements and their relationships', ()=> {
	let postIdHtml;
	let html;
	let formManager: BookingFormManager;
	let dateField: any;

	beforeAll(()=>{
		let mockData = new MockData();
		fetchMock.mock('*', ( url, opts )=>{ return mockData.response( url, opts ) } );
		html = fs.readFileSync('test/frontend/mock-page.html', 'utf8');

		postIdHtml = [
			'<div id="kl-post-id">														',
			'	<div class="elementor-widget-container">				',
			'		<div class="elementor-shortcode">							',
			'			1																						',
			'		</div>																				',
			'	</div>																					',
			'</div>																						'
		];
	});

	beforeEach(async()=>{
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
			expect( SimInput.isRadioShown( 'form-field-kl-booking-time-0' ) ).toBeTruthy();
			await SimInput.setValue( 'form-field-kl-booking-date', '2018-10-05' )
			expect( SimInput.isRadioShown( 'form-field-kl-booking-time-0' ) ).toBeFalsy();
		});

		it( 'shoud be readOnly', ()=>{
			expect( SimInput.getInputElementById('form-field-kl-booking-date').readOnly ).toBeTruthy();
		})

		it( 'should auto check a time option', async ()=> {
			expect( SimInput.isChecked('form-field-kl-booking-time-0') ).toBeFalsy();
			await SimInput.setValue( 'form-field-kl-booking-date', '2018-10-08' )
			expect( SimInput.isChecked('form-field-kl-booking-time-0') ).toBeTruthy();
		});

		it( 'should set focus on name field', async ()=> {
			document.getElementById( 'form-field-kl-booking-date' ).focus();
			expect( SimInput.hasFocus( 'form-field-kl-name' ) ).toBeFalsy();
			await SimInput.setValue( 'form-field-kl-booking-date', '2018-10-08' )
			expect( SimInput.hasFocus( 'form-field-kl-name' ) ).toBeTruthy();
		});

	});

	describe( 'on time set', ()=> {

		it( 'should set focus on name field', async ()=> {
			document.getElementById( 'form-field-kl-booking-date' ).focus();
			expect( SimInput.hasFocus( 'form-field-kl-name' ) ).toBeFalsy();
			await SimInput.check( 'form-field-kl-booking-time-0', true );
			expect( SimInput.hasFocus( 'form-field-kl-name' ) ).toBeTruthy();
		});

	});

	describe( 'on adult select', ()=> {

		xit( 'should set children select option so no more than allowed people can book', async ()=> {
			let maxPeople = MAX_SEATS_PER_GUIDE;
			let adults;
			let select = <HTMLSelectElement>document.getElementById( 'form-field-kl-children' );

			adults = 2;
			await SimInput.setValue( 'form-field-kl-adults', String( adults ) );
			expect( select.options.length ).toBe( maxPeople - adults + 1 );

			adults = 5;
			await SimInput.setValue( 'form-field-kl-adults', String( adults ) );
			expect( select.options.length ).toBe( maxPeople - adults + 1 );

			adults = 6;
			await SimInput.setValue( 'form-field-kl-adults', String( adults ) );
			expect( select.options.length ).toBe( maxPeople - adults + 1 );
		});

		it( 'should reset date', async ()=> {
			formManager.setState({date:'2018-10-10'});
			expect( SimInput.getInputElementById( 'form-field-kl-booking-date' ).value ).toEqual( '2018-10-10' );
			await SimInput.setValue( 'form-field-kl-adults', '3' );
			expect( formManager.state.date ).toEqual( '' );
		});

	});

	describe( 'on children select', ()=> {

		it( 'should reset date', async ()=> {
			formManager.setState({date:'2018-10-10'});
			expect( SimInput.getInputElementById( 'form-field-kl-booking-date' ).value ).toEqual( '2018-10-10' );
			await SimInput.setValue( 'form-field-kl-children', '2' );
			expect( formManager.state.date ).toEqual( '' );
		});

	});

	describe( 'on date reset', ()=>{
		it( 'should restore time to visible state', async ()=>{
			await SimInput.setValue( 'form-field-kl-booking-date', '2018-10-05' )
			expect( SimInput.isRadioShown( 'form-field-kl-booking-time-0' ) ).toBeFalsy();
			await SimInput.setValue( 'form-field-kl-children', '2' );
			expect( SimInput.isRadioShown( 'form-field-kl-booking-time-0' ) ).toBeTruthy();
			expect( SimInput.isRadioShown( 'form-field-kl-booking-time-1' ) ).toBeTruthy();
		})
	});

	describe( 'on submit button', ()=> {

		xit( 'should perform a booking', ()=> {

		});

	});

});
