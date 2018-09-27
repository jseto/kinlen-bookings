import {Database} from "./database";
import {GuideBooking} from "./guide-booking"
import {Utils} from "./utils";
export class Bookings {
  private _availMap: GuideBooking[];
  private _lastAvailMapDate: string;

  constructor() {
    this._availMap = [];
    this._lastAvailMapDate = '';
  }


  isSlotFree( restaurant: number, date: string, time: string, requiredSeats: number ) {
    this.fetchAvailMap( restaurant, date );


  }

  private async fetchAvailMap( restaurant: number, date: string ) {
    if ( !this.isAvailMapFresh( restaurant, date ) ) {
      let db = new Database();
      this._availMap = await db.getAvailabilityMap( restaurant, date );
      this._lastAvailMapDate = date;
    }
  }

  private isAvailMapFresh( restaurant: number, date: string ):boolean {
    Utils.checkValidDate( date );
    return false;
  }
}
