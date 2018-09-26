import {DatabaseObject} from "./database-object";

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
