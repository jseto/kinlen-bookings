import { RestaurantBooking } from "./restaurant-booking";
import { Guide } from "./guide";
import { TimeSlot } from "./time-slot";

export class GuideBooking {
  private _id: number;
  private _date: string;
  private _timeSlot: TimeSlot;
  private _restaurantBooking: RestaurantBooking;
  private _assignedGuide: Guide;
  private _bookedSeats: number;

  constructor( id: number, date?: string, timeSlot?: TimeSlot, restaurantBooking?: RestaurantBooking, assignedGuide?: Guide, bookedSeats?: number  ) {
    this._id = id;
    this.fillFields( date, timeSlot, restaurantBooking, assignedGuide, bookedSeats );
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

  getDate() {
    return this._date;
  }

  setTimeSlot( timeSlot: TimeSlot ){
    this._timeSlot = timeSlot;
    return this;
  }

  getTimeSlot() {
    return this._timeSlot;
  }

  setRestaurantBooking( restaurantBooking: RestaurantBooking ) {
    this._restaurantBooking = restaurantBooking;
    return this;
  }

  getRestautantBooking() {
    return this._restaurantBooking;
  }

  setAssignedGuide( assignedGuide: Guide ) {
    this._assignedGuide = assignedGuide;
    return this;
  }

  getAssignedGuide(){
    return this._assignedGuide;
  }

  setBookedSeats( seats: number ) {
    this._bookedSeats = seats;
    return this;
  }

  getBookedSeats() {
    return this._bookedSeats;
  }

  availableSeats() {
    return this._assignedGuide.maxOfferedSeats() - this._bookedSeats;
  }
}
