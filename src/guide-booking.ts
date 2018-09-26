import { DatabaseObject } from "./database-object"
import { RestaurantBooking } from "./restaurant-booking";
import { Guide } from "./guide";

export class GuideBooking extends DatabaseObject {
  private _date: string;
  private _time: string;
  private _timeLength: number;
  private _restaurantBooking: RestaurantBooking;
  private _assignedGuide: Guide;
  private _bookedSeats: number;

  fromObject( obj: any ){
    this._id = Number(obj.id);
    this._date = obj.date;
    this._time = obj.time;
    this._timeLength = Number( obj.time_length );
    this._restaurantBooking = new RestaurantBooking( Number( obj.restaurant_booking_id ) );
    this._assignedGuide = new Guide( Number( obj.guide_id ) );
    this._bookedSeats = Number( obj.booked_seats );
  }

  toObject() {
    return{
      id: this._id,
      date: this.date,
      time: this.time,
      time_length: this.timeLength,
      restautant_booking: this.restautantBooking.toObject(),
      assigned_guide: this.assignedGuide.toObject(),
      booked_seats: this.bookedSeats
    };
  }

  fillFields( date: string, time: string, timeLength: number, restaurantBooking: RestaurantBooking, assignedGuide: Guide, bookedSeats: number ) {
    this._date = date;
    this._time = time;
    this._timeLength = timeLength;
    this._restaurantBooking = restaurantBooking;
    this._assignedGuide = assignedGuide;
    this._bookedSeats = bookedSeats;
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

  setRestaurantBooking( restaurantBooking: RestaurantBooking ) {
    this._restaurantBooking = restaurantBooking;
    return this;
  }

  get restautantBooking() {
    return this._restaurantBooking;
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
    return this._assignedGuide.maxOfferedSeats() - this._bookedSeats;
  }
}
