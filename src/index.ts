import { DatePickerManager } from "./frontend/date-picker-manager";

export function datePickerManager( restaurantId ) {
	return new DatePickerManager( restaurantId );
}
