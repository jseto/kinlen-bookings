import {DatabaseObject} from "./database-object";

export class RestaurantBooking extends DatabaseObject {

  fromObject( p: any ) {
    throw('not implemented'+p)
  }

  toObject() {
    return {
      id: this._id
    };
  }
}
