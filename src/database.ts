import { DatabaseObject } from "./database-object";
import { Booking } from "./booking";
import { Guide } from "./guide";
import { Utils } from "./utils";

export class Database {

	private static _url = '/wp-json/kinlen/';

	getFreeGuide( date: string ):Promise<Guide> {
		let guide = new Guide(-1);
		return new Promise( ( resolve ) => {
			this.getREST( 'free_guide/', {date: date } ).then( ( data ) => {
				guide.fromObject( data[0] );
				resolve( guide );
			});
		});
	}

	getMonthBookings( restaurantId: number, date: string):Promise<Booking[]> {
		Utils.checkValidDate( date );
		let year_month = date.slice( 0, 8 );
		let minDate = year_month + '01';
		let maxDate = year_month + '31';;
		return new Promise( ( resolve ) => {
      this.getREST( 'booking_period/', {
				restaurant_booking_id: restaurantId,
			 	minDate: minDate,
				maxDate: maxDate
			}).then( ( data ) => {
				resolve( <Booking[]>this.buildList( data, ()=>{ return new Booking(-1) } ) );
      })
    });
	}

  getBooking( id: number ):Promise<Booking> {
		// select * from wp_kinlen_booking where id={id}
    let booking = new Booking(-1);
    return new Promise( ( resolve ) => {
      this.getREST( 'booking/', { id: id } ).then( ( data ) => {
        booking.fromObject( data[0] );
        resolve( booking );
      });
    });
  }

  getBookings( queryObject ):Promise<Booking[]> {
    return new Promise( ( resolve ) => {
      this.getREST( 'booking/', queryObject ).then( ( data ) => {
				resolve( <Booking[]>this.buildList( data, ()=> { return new Booking(-1) } ) );
      })
    });
  }

	private buildList( data:any, createInstance:() => DatabaseObject ):DatabaseObject[] {
		let list: DatabaseObject[] = [];
		let i = 0;
		while ( data[i] ) {
			let element =  createInstance();
			element.fromObject( data[i] );
			list.push( element );
			i++;
		}
		return list;
	}

  objectToQueryString( obj: Object ): string {
    return '?' + Object.keys(obj)
      .map( function(k) {
          return encodeURIComponent( k ) + '=' + encodeURIComponent( obj[ k ] );
      })
      .join('&');
  }

  private getREST( endpointCommand: string, queryObject: Object ) {
    let fullURL = Database._url + endpointCommand + this.objectToQueryString( queryObject );
    return new Promise( ( resolve ) => {
      fetch( fullURL ).then((resp)=>{
        let data = resp.json();
        resolve( data );
      }).catch(()=>{
        throw( new Error( 'Kinlen Booking System Error: ' ) );
      });
    });
  }

}
