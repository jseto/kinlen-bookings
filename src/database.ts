import {GuideBooking} from "./guide-booking";
import {RestaurantBooking} from "./restaurant-booking";
import {Guide} from "./guide";
import {TimeSlot} from "./time-slot";

export class Database {
  private static _url = '/wp-json/kinlen/';

  async testPromise( num: number ) {
    let promise = new Promise<any>( ( resolve: any ) =>{
      setTimeout( 500, () => {
        resolve( { id: 200, date: num } );
      });
    });
    let res = await promise;
    console.log(res.i);
    return res;
  }

  callTestPromise(){
    let ret = this.testPromise( 200 );
    console.log( ret );
  }

  private getREST( endpointCommand: string, object: Object ) {
    return new Promise<any>( ( resolve, reject ) => {
      jQuery.getJSON( Database._url + endpointCommand, object, ( data ) => {
        resolve( data );
      }).fail(()=>{
        reject( new Error( 'Kinlen Bookings Error: Failed ' + endpointCommand + ' RESTApi call') );
      });
    });
  }

  async getGuideBooking( date: string ) {
    let rawGuideBooking = await this.getREST( 'guide_booking/', { date: date } );

    let guideBooking = new GuideBooking( rawGuideBooking.id )
                                    .setDate( rawGuideBooking.date )
                                    .setTimeSlot( new TimeSlot( rawGuideBooking.time, rawGuideBooking.time_length ) )
                                    .setRestaurantBooking( new RestaurantBooking( rawGuideBooking.restaurant_booking_id ) )
                                    .setAssignedGuide( new Guide( rawGuideBooking.guide_id ) );
    return guideBooking;
  }
}
