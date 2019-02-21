
const _bookingErrors = {
	INVALID_DATE: 'The date entered is not correct.',
	BOOKING_NOT_AVAILABLE: 'The selected booking slot is no longer available. Please select another date or time slot.',
	INVALID_COUPON: 'The coupon code is not valid. Please check if you typed it correctly.',
}

export class BookingError extends Error{
	constructor( code: string ){
		let message = _bookingErrors[ code ];
		if ( message ) {
			super( message );
		}
		else super( code + ' error description not found' );
		this.code = code;
	}

	public code: string;
}
