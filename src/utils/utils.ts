
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

}
