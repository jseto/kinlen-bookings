import {GuideBooking} from "./guide-booking";

export class Database {
  private static _url = '/wp-json/kinlen/';

  getGuideBooking( date: string ):Promise<GuideBooking> {
    let guideBooking = new GuideBooking(-1);
    return new Promise( ( resolve ) => {
      this.getREST( 'guide_booking/', { date: date } ).then( ( data ) => {
        guideBooking.fromObject( data[0] );
        resolve( guideBooking );
      })
    });
  }

  getAvailabilityMap( date: string, restaurantId: number ):Promise<GuideBooking[]> {
    return new Promise( ( resolve ) => {
      this.getREST( 'avail_map/', {
          date: date,
          restaurant_booking_id: restaurantId
        }).then( ( data ) => {
        let guideBookings: GuideBooking[] = [];
        let i = 0;
        while ( data[i] ) {
          let gb = new GuideBooking(-1);
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
