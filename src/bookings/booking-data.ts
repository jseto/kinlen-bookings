import { Booking } from "./booking";
import { Guide, FreeGuide } from "./guide";
import { Utils } from "../utils/utils";
import { Rest } from "../database/rest";
import { Holiday } from "./holiday";

export class BookingData {


	getFreeGuide( date: string ):Promise<Guide> {
		let guide = new Guide(-1);
		return new Promise( ( resolve ) => {
			Rest.getREST( 'free_guide/', {date: date } ).then( ( data ) => {
				guide.fromObject( data );
				resolve( guide );
			});
		});
	}

	getMonthFreeGuide( date: string ):Promise<FreeGuide[]> {
		return new Promise((resolve)=>{
			Rest.getMonthPeriod( 'free_guide/', date, {} ).then( ( data ) => {
				resolve( <FreeGuide[]>Rest.buildList( data, ()=>{ return new FreeGuide(-1) } ) );
			})
		});

	}

	getMonthBookings( restaurantId: number, date: string):Promise<Booking[]> {
		return new Promise((resolve)=>{
			Rest.getMonthPeriod( 'booking_period/', date, { restaurant_id: restaurantId } ).then( ( data ) => {
				resolve( <Booking[]>Rest.buildList( data, ()=>{ return new Booking(-1) } ) );
      })
    });
	}

  getBooking( id: number ):Promise<Booking> {
		// select * from wp_kinlen_booking where id={id}
    let booking = new Booking(-1);
    return new Promise( ( resolve ) => {
      Rest.getREST( 'booking/', { id: id } ).then( ( data ) => {
        booking.fromObject( data[0] );
        resolve( booking );
      });
    });
  }

  getBookings( queryObject ):Promise<Booking[]> {
    return new Promise( ( resolve ) => {
      Rest.getREST( 'booking/', queryObject ).then( ( data ) => {
				resolve( <Booking[]>Rest.buildList( data, ()=> { return new Booking(-1) } ) );
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
			Rest.getMonthPeriod( 'restaurant_holiday_period/', date, { id: restaurantId } ).then( ( data ) => {
				resolve( <Holiday[]>Rest.buildList( data, ()=>{ return new Holiday(-1) } ) );
      })
    });
	}

	setHoliday( endpoint: string, id: number, date: string ) {
		Utils.checkValidDate( date );
		return Rest.postREST( endpoint, {
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
			Rest.getREST( endpoint, q ).then((data)=>{
				resolve( <Holiday[]>Rest.buildList( data, ()=>{ return new Holiday(-1) } ) );
			})
		});
	}
}
