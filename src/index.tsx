import { BookingMapper } from "./booking-mapper";


export function bookingMap( restaurant ) {
	const bookingMapper = new BookingMapper( restaurant );
	return bookingMapper;
}
