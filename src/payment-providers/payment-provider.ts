import { BookingProcessor } from "../bookings/booking-processor";
import { BookingError } from "../bookings/BookingError";

export const PaymentErrors = {
	BOOKING_NOT_AVAILABLE: 'The selected booking slot is no longer available. Please select another date or time slot or try later.',
	PAYMENT_CANCELLED: 'The payment has not been fulfilled. Please try again to guaranty your booking.',
	PAYMENT_ERROR: 'There has been an error during the payment process. Please try again to guaranty your booking.',
	BOOKING_NOT_UPDATED: 'We are sorry. At this time we cannot complete the booking process due to technical reason. We will contact you by email to refund your money. Sorry for the inconvenience.'
}

export interface PaymentData {
	paymentId: string,
	paymentProvider: string,
	paidAmount: number,
	currency: string,
}

export abstract class PaymentProvider {
	constructor( anchorElementId: string ) {
		this._anchorElementId = anchorElementId;
	}

	abstract renderButton(): Promise< void >;

	set onStartPayment( callBack: () => Promise<boolean> ) {
		this._onStartPayment = callBack;
	}

	get onStartPayment() {
		return this._onStartPayment;
	}

	set onAuthorize( callBack: ( paymentData: PaymentData ) => Promise<any> ) {
		this._onAuthorize = callBack;
	}

	get onAuthorize() {
		return this._onAuthorize;
	}

	set onError( callBack: ( error: BookingError )=> void ) {
		this._onError = callBack;
	}

	get onError() {
		return this._onError;
	}

	set onCancel( callBack: ()=>Promise<boolean> ) {
		this._onCancel = callBack;
	}

	get onCancel() {
		return this._onCancel;
	}

	setBookingProcessor( processor: BookingProcessor ) {
		this._bookingProcessor = processor;
		return this;
	}

	get bookingProcessor() {
		return this._bookingProcessor;
	}

	get anchorElementId() {
		return this._anchorElementId;
	}

	protected _anchorElementId: string;
	private _bookingProcessor: BookingProcessor;
	private _onStartPayment: () => Promise<boolean>;
	private _onAuthorize: ( paymentData: PaymentData ) => Promise<any>;
	private _onError: ( error: BookingError ) => void;
	private _onCancel: () => Promise<boolean>;
}
