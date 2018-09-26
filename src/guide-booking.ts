import { DatabaseObject } from "./database-object"
import { RestaurantBooking } from "./restaurant-booking";
import { Guide } from "./guide";
import { TimeSlot } from "./time-slot";

export class GuideBooking extends DatabaseObject {
  private _date: string;
  private _timeSlot: TimeSlot;
  private _restaurantBooking: RestaurantBooking;
  private _assignedGuide: Guide;
  private _bookedSeats: number;

  clone( obj: any ){
    this._id = Number(obj.id);
    this._date = obj.date;
    this._timeSlot = new TimeSlot( obj.time, Number( obj.time_length ) );
    this._restaurantBooking = new RestaurantBooking( Number( obj.restaurant_booking_id ) );
    this._assignedGuide = new Guide( Number( obj.guide_id ) );
    this._bookedSeats = Number( obj.booked_seats );
  }

  fillFields( date: string, timeSlot: TimeSlot, restaurantBooking: RestaurantBooking, assignedGuide: Guide, bookedSeats: number ) {
    this._date = date;
    this._timeSlot = timeSlot;
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

  setTimeSlot( timeSlot: TimeSlot ){
    this._timeSlot = timeSlot;
    return this;
  }

  get timeSlot() {
    return this._timeSlot;
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
