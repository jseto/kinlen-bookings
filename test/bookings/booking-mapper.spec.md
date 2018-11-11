BookingMapper is a class providing the following services:
	a booking map where month days are the indexes of the array.
		if there is no booking for the day
			should return false
		if there are bookings for the day
			should return the bookings for that day and time
	a function to know about of availability.
		should accept restaurant and date as parameters
		should accept optionally time
		reporting that a slot is available when:
			there is a free guide whether one of the following conditions happen:
				a guide is assigned to this restaurant and still have seats available
					should have this guide assigned to this restaurant in this slot
					should have seats available
					should happen both of the above conditions
				when guide is available for the day
					should not have bookings for the day
					should not be blocked (holiday, etc.) for the booking day
					should verify both of the above conditions; no booking and no holiday for the day
			the restaurant open that day
				should not be blocked for the booking day
			should verify both of the above conditions; a free guide and the restaurant is open
