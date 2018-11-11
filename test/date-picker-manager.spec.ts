import * as fetchMock from 'fetch-mock';
import { MockData } from './mock-data/db-sql';
import * as flatpickr from "flatpickr";
import { DatePickerManager } from '../src/frontend/date-picker-manager';

describe( 'DatePickerManager provides a bridge between TS and JSES5', ()=> {
	let datePickerManager = new DatePickerManager( 1 );

	let mockData: MockData;

	beforeEach(()=>{
		mockData = new MockData();
		fetchMock.mock('*', ( url, opts )=>{ return mockData.response( url, opts ) } );
	});

	afterEach(()=>{
		fetchMock.restore();
		mockData.close();
	});

	describe( 'updateDates is a callback funtion', ()=> {

		it( 'should return a map of disabled days ', async ()=> {
			let emptyDate: Date[] = [];
			let redraw = jest.fn();

			let datePickerInstance = {
				currentYear: 2018,
				currentMonth: 9,
				config: {
					disable: emptyDate
				},
				redraw: <()=>void>redraw
			};
			await datePickerManager.updateDates( <flatpickr.default.Instance>datePickerInstance );
			expect( redraw.mock.calls.length ).toBe( 1 );
		});

	});

});
