import * as fetchMock from 'fetch-mock';
import { MockData } from '../mock-data/db-sql';
import { Rest } from '../../src/database/rest';

describe( 'Database helpers', ()=>{
	describe( 'objectToQueryString method:', ()=>{
		it( 'Should work for unitary objects', ()=>{
			let obj = {
				date: '2018-09-25'
			}
			let query = Rest.objectToQueryString( obj );
			expect( query ).toEqual( '?date=2018-09-25' );
		});
	});
});

describe( 'Mock data', ()=>{
	let mockData: MockData;

	beforeEach(()=>{
		mockData = new MockData();
	})

	afterEach(()=>{
		mockData.close();
	})

	it( 'should return all elements from endpoint when no url parameter',()=>{
		let resp = mockData.response( '/wp-json/kinlen/mock_data_test_data/' );
		expect( resp.length ).toBe( 2 );
	})

	it( 'Should return one element when querying id', ()=>{
		let resp = mockData.response( '/wp-json/kinlen/mock_data_test_data/?id=1' );
		expect( resp.length ).toBe( 1 );
		expect( resp[0].name ).toEqual( 'Pankaj' );
	});

	it( 'Should return one element when querying id 2 parameters', ()=>{
		let resp = mockData.response( '/wp-json/kinlen/mock_data_test_data/?id=2&name=David' );
		expect( resp.length ).toBe( 1 );
		expect( resp[0].salary ).toBe( 5000 );
	});

	it( 'should insert data on post method', ()=>{
		let resp = mockData.response( '/wp-json/kinlen/mock_data_test_data/', {
															method: 'POST',
															body: JSON.stringify({
																id:4,
																name: "Pepe",
																salary: 2500
															})
														});
		expect( resp ).toBeTruthy();
		let resp2 = mockData.response( '/wp-json/kinlen/mock_data_test_data/?id=4' );
		expect( resp2[0].name ).toEqual( 'Pepe' );
	});

	it( 'should insert data with id AUTO_INCREMENT on post method', ()=>{
		let resp = mockData.response( '/wp-json/kinlen/mock_data_test_data/', {
															method: 'POST',
															body: JSON.stringify({
																name: "Pepe el 3",
																salary: 2500
															})
														});
		expect( resp[0].id ).toBe( 3 );
		let resp2 = mockData.response( '/wp-json/kinlen/mock_data_test_data/?id=3' );
		expect( resp2[0].name ).toEqual( 'Pepe el 3' );
	});

	describe( 'using fetch', ()=>{

		beforeEach(()=>{
			fetchMock.mock('*', ( url, opts )=>{ return mockData.response( url, opts ) } );
		});

		it( 'should insert data with id AUTO_INCREMENT on post method using REST', async ()=>{
			let resp = await Rest.postREST('mock_data_test_data/',{
				name: "Pepe el 3",
				salary: 2500
			});
			expect( resp[0].id ).toBe( 3 );
			let resp2 = await Rest.getREST( 'mock_data_test_data/', { id: 3 } );
			expect( resp2[0].name ).toEqual( 'Pepe el 3' );
		});

	});
});
