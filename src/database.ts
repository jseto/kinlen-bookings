import { DatabaseObject, Holiday } from "./database-object";
import { Booking } from "./booking";
import { Guide } from "./guide";
import { Utils } from "./utils";

export class Database {
	private static _url = '/wp-json/kinlen/';

	getFreeGuide( date: string ):Promise<Guide> {
		let guide = new Guide(-1);
		return new Promise( ( resolve ) => {
			this.getREST( 'free_guide/', {date: date } ).then( ( data ) => {
				guide.fromObject( data );
				resolve( guide );
			});
		});
	}

	// getMonthFreeGuide( date: string ):Promise<Guide[]> {
	//
	// }

	getMonthBookings( restaurantId: number, date: string):Promise<Booking[]> {
		return new Promise((resolve)=>{
			this.getMonthPeriod( 'booking_period/', date, { restaurant_id: restaurantId } ).then( ( data ) => {
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

	setGuideHoliday( guideId: number, date: string ) {
		return this.setHoliday( 'guide_holiday/', guideId, date );
	}

	getGuideHolidays( guideId: number, date?: string ): Promise<Holiday[]> {
		return this.getHolidays( 'guide_holiday/', guideId, date )
	}

	setRestaurantHoliday( restaurantId: number, date: string ) {
		return this.setHoliday( 'restaurant_holiday/', restaurantId, date );
	}

	getRestaurantHolidays( restaurantId: number, date?: string ): Promise<Holiday[]> {
		return this.getHolidays( 'restaurant_holiday/', restaurantId, date )
	}

	getRestaurantMonthHolidays( restaurantId: number, date: string ): Promise<Holiday[]> {
		return new Promise((resolve)=>{
			this.getMonthPeriod( 'restaurant_holiday_period/', date, { id: restaurantId } ).then( ( data ) => {
				resolve( <Holiday[]>this.buildList( data, ()=>{ return new Holiday(-1) } ) );
      })
    });
	}

	setHoliday( endpoint: string, id: number, date: string ) {
		Utils.checkValidDate( date );
		return this.postREST( endpoint, {
			id: id,
			date: date
		});
	}

	getHolidays( endpoint: string, id: number, date?: string ): Promise<Holiday[]> {
		let q = { id: id };
		if ( date != undefined ) {
			q[ 'date' ] = date;
		}
		return new Promise( ( resolve ) => {
			this.getREST( endpoint, q ).then((data)=>{
				resolve( <Holiday[]>this.buildList( data, ()=>{ return new Holiday(-1) } ) );
			})
		});
	}

  objectToQueryString( obj: Object ): string {
    return '?' + Object.keys(obj)
      .map( function(k) {
          return encodeURIComponent( k ) + '=' + encodeURIComponent( obj[ k ] );
      })
      .join('&');
  }

	private getMonthPeriod( endpoint: string, date: string, queryObject: {} ) {
		Utils.checkValidDate( date );
		let year_month = date.slice( 0, 8 );
		let minDate = year_month + '01';
		let maxDate = year_month + '31';
		queryObject[ 'minDate' ] = minDate;
		queryObject[ 'maxDate' ] = maxDate;
		return this.getREST( endpoint, queryObject );
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

	private postREST( endpointCommand: string, dataObject: {} ) {
		let fullURL = Database._url + endpointCommand;
		return fetch( fullURL, {
	    method: 'POST',
	    headers: {
	      'Accept': 'application/json',
	      'Content-Type': 'application/json'
	    },
	    body: JSON.stringify( dataObject )
  	});
	}

  private getREST( endpointCommand: string, queryObject: Object ) {
    let fullURL = Database._url + endpointCommand + this.objectToQueryString( queryObject );
    return new Promise( ( resolve ) => {
      fetch( fullURL ).then((resp)=>{
        let data = resp.json();
        resolve( data );
      }).catch((error)=>{
        throw( new Error( 'Kinlen Booking System: ' + error.message ) );
      });
    });
  }
}
