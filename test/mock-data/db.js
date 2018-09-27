module.exports = mockData

function mockData () {
  return {
    guide_booking: [
      {
        id: '1',
        date: '2018-09-25',
        time: '19:00:00',
        time_length: '0',
        restaurant_booking_id: '1',
        guide_id: '1',
        booked_seats: '2'
      },
      {
        id: '2',
        date: '2018-09-25',
        time: '21:00:00',
        time_length: '0',
        restaurant_booking_id: '1',
        guide_id: '1',
        booked_seats: '2'
      },
      {
        id: '3',
        date: '2018-09-25',
        time: '19:00:00',
        time_length: '0',
        restaurant_booking_id: '1',
        guide_id: '1',
        booked_seats: '4'
      },
      {
        id: '4',
        date: '2018-09-26',
        time: '19:00:00',
        time_length: '0',
        restaurant_booking_id: '1',
        guide_id: '1',
        booked_seats: '2'
      }
    ],
    avail_map: function (date, restaurant) {
      var i = 0;
      var gb = this.guide_booking;
      var res = [];
      while ( gb[i] ) {
        if ( gb[i].date >= date
              & gb[i].date < ( date.slice( 0, 8 ) + '31' )
              & gb[i].restaurant_booking_id === String(restaurant) ) {
          res.push( gb[i] );
        }
        i++;
      }
      return res;
    }
}}
