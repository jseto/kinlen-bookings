import { DatabaseObject } from "./database-object"
import { Restaurant } from "./restaurant";
import { Guide } from "./guide";

export const BOOKABLE_TIMES = [ '19:00:00', '21:00:00' ];

export class Booking extends DatabaseObject {
  private _date: string;
  private _time: string;
  private _timeLength: number;
  private _restaurant: Restaurant;
  private _assignedGuide: Guide;
  private _bookedSeats: number;

  fromObject( obj: any ){
    this._id = Number(obj.id);
    this._date = obj.date;
    this._time = obj.time;
    this._timeLength = Number( obj.time_length );
    this._restaurant = new Restaurant( Number( obj.restaurant_id ) );
    this._assignedGuide = new Guide( Number( obj.guide_id ) );
    this._bookedSeats = Number( obj.booked_seats );
  }

  toObject() {
    return{
      id: this._id,
      date: this.date,
      time: this.time,
      time_length: this.timeLength,
      restautant: this.restautant.toObject(),
      assigned_guide: this.assignedGuide.toObject(),
      booked_seats: this.bookedSeats
    };
  }

  setDate( date: string ) {
    this._date=date;
    return this;
  }

  get date() {
    return this._date;
  }

  setTime( time: string ){
    this._time = time;
    return this;
  }

  get time() {
    return this._time;
  }

  setTimeLength( time: number ){
    this._timeLength = time;
    return this;
  }

  get timeLength() {
    return this._timeLength;
  }

  setRestaurant( restaurant: Restaurant ) {
    this._restaurant = restaurant;
    return this;
  }

  get restautant() {
    return this._restaurant;
  }

  setAssignedGuide( assignedGuide: Guide ) {
    this._assignedGuide = assignedGuide;
    return this;
  }

  get assignedGuide(){
    return this._assignedGuide;
  }

  setBookedSeats( seats: number ) {
    this._bookedSeats = seats;
    return this;
  }

  get bookedSeats() {
    return this._bookedSeats;
  }

  availableSeats() {
    return this._assignedGuide.maxSeats() - this._bookedSeats;
  }
}
