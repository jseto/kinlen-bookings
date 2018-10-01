import {DatabaseObject} from "./database-object";

export const MAX_SEATS_PER_GUIDE = 6;

export class Guide extends DatabaseObject{

  maxOfferedSeats(): number{
    return 6;
  };

  toObject(){
    return {
      id: this._id
    };
  }

  fromObject( p: any ) {
    throw('not implemented'+p)
  }
}
