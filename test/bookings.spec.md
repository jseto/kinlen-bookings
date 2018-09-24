Booking system
  when require free slots
    should return a map of the free slots for the month
    Free slot for a restaurant is when have free guide and restaurant is open
      Restaurant have free guide
        Free guide is when one of the below conditions happens
          when guide is assigned to this restaurant and still have seats available
            Guide is assigned to this restaurant
            Guide have seats available
            Both of the above conditions happen
          when guide is not assigned to any restaurant for the day
          One of the above conditions happen
      Restaurant open that day
      Both of the above conditions happen
