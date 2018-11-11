import {DatabaseObject} from "./database-object";

export class Restaurant extends DatabaseObject {

  _fromObject( p: any ) {
    throw('not implemented'+p)
  }

  _toObject() {
    return {
    };
  }
}
