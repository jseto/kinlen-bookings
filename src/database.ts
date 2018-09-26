import { DatabaseObject } from "./database-object"
import {GuideBooking} from "./guide-booking";

export class Database {
  private static _url = '/wp-json/kinlen/';

  private getREST( retrievedObject: DatabaseObject, endpointCommand: string, queryObject: Object ) {
    return new Promise( ( resolve, reject ) => {
      jQuery.getJSON( Database._url + endpointCommand, queryObject, ( data ) => {
        retrievedObject.clone( data[0] );
        resolve( retrievedObject );
      }).fail((val, val2, val3 )=>{
        console.log('Kinlen Bookings Error:', val.status, val2, val3);
        reject( new Error( 'Kinlen Bookings Error: Failed ' + endpointCommand + ' RESTApi call') );
      });
    });
  }

  getGuideBooking( date: string ):Promise<GuideBooking> {
      let guideBooking = new GuideBooking(-1);
      return < Promise<GuideBooking> >this.getREST( guideBooking,'guide_booking/', { date: date } );
  }
}
