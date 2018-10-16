import {DatabaseObject} from "./database-object";

export class Restaurant extends DatabaseObject {

  fromObject( p: any ) {
    throw('not implemented'+p)
  }

  toObject() {
    return {
      id: this._id
    };
  }
}
