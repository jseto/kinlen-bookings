import { Booking } from "./booking";
import { Guide, FreeGuide } from "./guide";
import { Rest } from "../database/rest";
import { Holiday } from "./holiday";
import { Utils } from "../utils/utils";

export class BookingData {


	static getFreeGuide( date: Date ):Promise<Guide> {
		let guide = new Guide(-1);
		return new Promise( ( resolve ) => {
			Rest.getREST( 'free_guide/', { date: Utils.dateToString( date ) } ).then( ( data ) => {
				guide.fromObject( data );
				resolve( guide );
			});
		});
	}

	static getMonthFreeGuide( date: Date ):Promise<FreeGuide[]> {
		return new Promise((resolve)=>{
			Rest.getMonthPeriod( 'free_guide/', Utils.dateToString( date ), {} ).then( ( data ) => {
				resolve( <FreeGuide[]>Rest.buildList( data, ()=>{ return new FreeGuide(-1) } ) );
			})
		});

	}

static getMonthBookings( restaurantId: number, date: Date):Promise<Booking[]> {
		return new Promise((resolve)=>{
			Rest.getMonthPeriod( 'booking_period/', Utils.dateToString( date ), { restaurant_id: restaurantId } ).then( ( data ) => {
				resolve( <Booking[]>Rest.buildList( data, ()=>{ return new Booking(-1) } ) );
      })
    });
	}

  static getBooking( id: number ):Promise<Booking> {
		// select * from wp_kinlen_booking where id={id}
    let booking = new Booking(-1);
    return new Promise( ( resolve ) => {
      Rest.getREST( 'booking/', { id: id } ).then( ( data ) => {
        booking.fromObject( data[0] );
        resolve( booking );
      });
    });
  }

  static getBookings( queryObject: Object ):Promise<Booking[]> {
    return new Promise( ( resolve ) => {
      Rest.getREST( 'booking/', queryObject ).then( ( data ) => {
				resolve( <Booking[]>Rest.buildList( data, ()=> { return new Booking(-1) } ) );
      })
    });
  }

	static setGuideHoliday( guideId: number, date: Date ) {
		return this.setHoliday( 'guide_holiday/', guideId, date );
	}

	static getGuideHolidays( guideId: number, date?: Date ): Promise<Holiday[]> {
		return this.getHolidays( 'guide_holiday/', guideId, date )
	}

	static setRestaurantHoliday( restaurantId: number, date: Date ) {
		return this.setHoliday( 'restaurant_holiday/', restaurantId, date );
	}

	static getRestaurantHolidays( restaurantId: number, date?: Date ): Promise<Holiday[]> {
		return this.getHolidays( 'restaurant_holiday/', restaurantId, date )
	}

	static getRestaurantMonthHolidays( restaurantId: number, date: Date ): Promise<Holiday[]> {
		return new Promise((resolve)=>{
			Rest.getMonthPeriod( 'restaurant_holiday_period/', Utils.dateToString( date ), { id: restaurantId } ).then( ( data ) => {
				resolve( <Holiday[]>Rest.buildList( data, ()=>{ return new Holiday(-1) } ) );
      })
    });
	}

	static setHoliday( endpoint: string, id: number, date: Date ) {
		return Rest.postREST( endpoint, {
			id: id,
			date: Utils.dateToString( date )
		});
	}

	static getHolidays( endpoint: string, id: number, date?: Date ): Promise<Holiday[]> {
		let q = { id: id };
		if ( date != undefined ) {
			q[ 'date' ] = Utils.dateToString( date );
		}
		return new Promise( ( resolve ) => {
			Rest.getREST( endpoint, q ).then((data)=>{
				resolve( <Holiday[]>Rest.buildList( data, ()=>{ return new Holiday(-1) } ) );
			})
		});
	}
}
