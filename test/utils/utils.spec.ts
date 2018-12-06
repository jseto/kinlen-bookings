import {Utils} from "../../src/utils/utils"

describe( 'In Utils class', function() {

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
