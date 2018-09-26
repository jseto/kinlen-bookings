import {DatabaseObject} from "./database-object";

export class Guide extends DatabaseObject{

  clone() {
    throw('not implemented')
  }

  maxOfferedSeats(): number{
    return 6;
  };

}
