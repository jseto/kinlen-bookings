import {DatabaseObject} from "./database-object";

export class Guide extends DatabaseObject{

  maxOfferedSeats(): number{
    return 6;
  };

  toObject(){
    return {};
  }

  fromObject( p: any ) {
    throw('not implemented')
  }
}
