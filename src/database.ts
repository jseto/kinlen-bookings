import { DatabaseObject } from "./database-object"
import {GuideBooking} from "./guide-booking";

export class Database {
  private static _url = '/wp-json/kinlen/';

  getGuideBooking( date: string ):Promise<GuideBooking> {
      let guideBooking = new GuideBooking(-1);
      return < Promise<GuideBooking> >this.getREST( guideBooking,'guide_booking/', { date: date } );
  }

  // private getRESTAjax( retrievedObject: DatabaseObject, endpointCommand: string, queryObject: Object ) {
  //   return new Promise( ( resolve, reject ) => {
  //     jQuery.getJSON( Database._url + endpointCommand, queryObject, ( data ) => {
  //       retrievedObject.clone( data[0] );
  //       resolve( retrievedObject );
  //     }).fail((val, val2, val3 )=>{
  //       console.log('Kinlen Bookings Error:', val.status, val2, val3);
  //       reject( new Error( 'Kinlen Bookings Error: Failed ' + endpointCommand + ' RESTApi call') );
  //     });
  //   });
  // }

  objectToQueryString( obj: Object ): string {
    return '?' + Object.keys(obj)
      .map( function(k) {
          return encodeURIComponent( k ) + '=' + encodeURIComponent( obj[ k ] );
      })
      .join('&');
  }

  private getREST( retrievedObject: DatabaseObject, endpointCommand: string, queryObject: Object ) {
    let fullURL = Database._url + endpointCommand + this.objectToQueryString( queryObject );
    return new Promise( ( resolve ) => {
      fetch( fullURL ).then((resp)=>{
        return resp.json();
      }).then((data)=>{
        retrievedObject.clone( data[0] );
        resolve( retrievedObject );
      });
    });
  }

}
