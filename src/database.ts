import {Booking} from "./guide-booking";
import {Utils} from "./utils";
export class Database {
  private static _url = '/wp-json/kinlen/';

  getGuideBooking( date: string ):Promise<Booking> {
    Utils.checkValidDate( date );
    let guideBooking = new Booking(-1);
    return new Promise( ( resolve ) => {
      this.getREST( 'guide_booking/', { date: date } ).then( ( data ) => {
        guideBooking.fromObject( data[0] );
        resolve( guideBooking );
      })
    });
  }

  getAvailabilityMap( restaurantId: number, date: string ):Promise<Booking[]> {
    Utils.checkValidDate( date );
    return new Promise( ( resolve ) => {
      this.getREST( 'avail_map/', {
          date: date,
          restaurant_booking_id: restaurantId
        }).then( ( data ) => {
        let guideBookings: Booking[] = [];
        let i = 0;
        while ( data[i] ) {
          let gb = new Booking(-1);
          gb.fromObject( data[i] );
          guideBookings.push( gb );
          i++;
        }
        resolve( guideBookings );
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
