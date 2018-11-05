
export class Utils {

	static isSameMonth( a: string, b: string ):boolean {
		if ( !( a && b ) ) {
			return false;
		}
		this.checkValidDate(a);
		this.checkValidDate(b);
		return ( a.slice( 5, 7 ) === b.slice( 5, 7 )
						&& a.slice( 0, 4 ) === b.slice( 0, 4 ) );
	}

	static checkValidDate( d: string ) {
		if ( !( d[4] == '-' &&  d[7] == '-' &&  d.length == 10 ) ) {
			throw( new Error('Kinlen Bookings System Error: invalid date' ) );
		}
	}

	static toString( n: number, leftPad: number, char:string = '0' ) {
		let str: string = String( n );
		while ( str.length < leftPad ) str = char + str;
		return str;
	}
}
