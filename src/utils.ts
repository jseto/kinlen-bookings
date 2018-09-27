
export class Utils {

  static isSameMonth( a: string, b: string ):boolean {
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
}