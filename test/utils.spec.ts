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
			'2008-00-00',
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

	describe( 'dateToString', ()=>{
		it ( 'should return date format YYYY-MM-DD', ()=>{
			let date = new Date( 2018, 9, 2 );
			expect( Utils.dateToString( date ) ).toEqual( '2018-10-02' );
		})
		it ( 'should return date format YYYY-MM-DD near begining of month', ()=>{
			let date = new Date( 2018, 9, 1 );
			expect( Utils.dateToString( date ) ).toEqual( '2018-10-01' );
		})
	});

	describe( 'toString', ()=>{
		it( 'should return string padded with 0 by default', ()=>{
			expect( Utils.toString( 3, 4 ) ).toEqual( '0003' );
		})
		it( 'should return string without padding if more digits than padding', ()=>{
			expect( Utils.toString( 3000, 3 ) ).toEqual( '3000' );
			expect( Utils.toString( 300, 3 ) ).toEqual( '300' );
		})
		it( 'should return string padded with char if specified', ()=>{
			expect( Utils.toString( 3, 4, ' ' ) ).toEqual( '   3' );
		})
	})
});
