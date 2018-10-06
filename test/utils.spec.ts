import {Utils} from "../src/utils"

describe( 'In Utils class', function() {

	describe( 'a valid Date', function() {
		let invalidDate = [
			'',
			'2000.00.00',
			'00-00-0000',
			'00-00-00',
			'2000/00/00',
			'2000-8-00',
			'2000-12-2'
		];

		let validDate = '2000-00-00';


		it( 'should throw on invalid date', function() {
			invalidDate.forEach(( date )=>{
				expect( ()=>{ Utils.checkValidDate( date ) } ).toThrowError();
			});
		});

		it( 'should not throw on good date', function() {
			expect( ()=>{ Utils.checkValidDate( validDate ) } ).not.toThrow();
		});

	});

	describe( 'a date of equal month ', function() {
		let date = '2000-00-00';
		let differentMonth = [
			'2009-00-00',
			'2000-01-00',
			''
		]

		let sameMonth = [
			'2000-00-00',
			'2000-00-23'
		]

		it( 'shoul have the same month part', function() {
			differentMonth.forEach(( diff )=>{
				expect( Utils.isSameMonth( date, diff ) ).toBeFalsy();
			});
			sameMonth.forEach(( same )=>{
				expect( Utils.isSameMonth( date, same ) ).toBeTruthy();
			});
		});

		it( 'should have any of the dates not empty or null', ()=>{
			sameMonth.forEach(( same )=>{
				expect( Utils.isSameMonth( '', same ) ).toBeFalsy()
				expect( Utils.isSameMonth( same, null ) ).toBeFalsy()
			})
		});

	});

	// describe( 'function parseUrl', ()=>{
	// 	it( 'should work with single url', ()=>{
	// 		let url = Utils.parseUrl( '/single' );
	// 		expect( url.base ).toEqual('/single');
	//
	// 	})
	// });

});
