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
	});

	describe( 'keyValueStringToObj', ()=>{
		it( 'should parse a key value string', ()=>{
			let str = 'key1=value1;key2=value2;key3=value3';
			let obj = Utils.keyValueStringToObj( str );
			expect( obj[ 'key1' ] ).toEqual( 'value1' );
			expect( obj[ 'key2' ] ).toEqual( 'value2' );
			expect( obj[ 'key3' ] ).toEqual( 'value3' );
		});
		it( 'should remove leading and trailing spaces spaces', ()=>{
			let str = 'key1 = value1; key2 =value2 ; key3= value3';
			let obj = Utils.keyValueStringToObj( str );
			expect( obj[ 'key1' ] ).toEqual( 'value1' );
			expect( obj[ 'key2' ] ).toEqual( 'value2' );
			expect( obj[ 'key3' ] ).toEqual( 'value3' );
		})
		it( 'should not remove inner spaces of value', ()=>{
			let str = 'key1 = value 1; key2 =value 2 ; key3= value 3';
			let obj = Utils.keyValueStringToObj( str );
			expect( obj[ 'key1' ] ).toEqual( 'value 1' );
			expect( obj[ 'key2' ] ).toEqual( 'value 2' );
			expect( obj[ 'key3' ] ).toEqual( 'value 3' );
		})
		it( 'should work for only 1 entry', ()=>{
			let str = ' key1 = value 1 ';
			let obj = Utils.keyValueStringToObj( str );
			expect( obj[ 'key1' ] ).toEqual( 'value 1' );
		});
		it( 'should return null for an emptry string', ()=>{
			let obj = Utils.keyValueStringToObj( '' );
			expect( obj[ 'key1' ] ).toBeUndefined();
		});
	});
});
