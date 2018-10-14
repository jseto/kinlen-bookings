import { DatabaseObject } from "./database-object";
import { Booking } from "./booking";
import { Guide, GuideHoliday } from "./guide";
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

	blockGuide( guideId: number, date: string ) {
		Utils.checkValidDate( date );
		return this.postREST( 'guide_holiday/', {
			id: guideId,
			date: date
		});
	}

	getGuideHolidays( guideId: number, date?: string ): Promise<GuideHoliday[]> {
		let q = { id: guideId };
		if ( date != undefined ) {
			q[ date ] = date;
		}
		return new Promise( ( resolve ) => {
			this.getREST( 'guide_holiday/', q ).then((data)=>{
				resolve( <GuideHoliday[]>this.buildList( data, ()=>{ return new GuideHoliday(-1) } ) );
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
