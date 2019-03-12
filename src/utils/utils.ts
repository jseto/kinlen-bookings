
export class Utils {

	static dateToString( date: Date ): string {
		let str: string = String( date.getFullYear() ) + '-'
										+ Utils.toString( date.getMonth()+1, 2 ) + '-'
										+ Utils.toString( date.getDate(), 2 );
		return str;
	}

	static toString( n: number, leftPad: number, char:string = '0' ): string {
		let str: string = String( n );
		while ( str.length < leftPad ) str = char + str;
		return str;
	}

	static isInvalid( date: Date ): boolean {
		return isNaN( date.getMilliseconds() );
	}

	static forceUTC( date: Date, hour: number, min:number ): number {
		return Date.UTC( date.getFullYear(), date.getMonth(), date.getDate(), hour, min );
	}

	/**
	 * Converts a Key-Value string to an object.
	 * @param  str a string with key value pair separated by the equal sing and every
	 * 							entry separated by a semicolon. This is a sample String
	 * 							'key=value;name=Peter;surname=Sellers'
	 * @return     an object with key and values parsed
	 */
	static keyValueStringToObj( str: String ):{} {
		let arr = str.split(';');
		let obj = {};
		arr.forEach((value)=>{
			let equalSignPos = value.indexOf('=');
			obj[ value.slice( 0, equalSignPos ).trim() ] = value.slice( equalSignPos + 1 ).trim();
		});
		return obj;
	}

}
