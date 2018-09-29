var dataBase = require('./db.json');

module.exports = mockData


function mockData ( url ) {
	if ( typeof url === 'undefined' )	return null;

	var urlParams = url.slice( url.indexOf('?')+1, url.length );
	var urlWithoutParams = url;

	if ( urlParams !== url ) {
		urlWithoutParams = url.slice( 0, url.indexOf('?')-1 );
	}
	else {
		urlParams = '';
		urlWithoutParams = url.slice( 0, url.length - 1 );
	}

	var endpoint = urlWithoutParams.slice( urlWithoutParams.lastIndexOf('/')+1, urlWithoutParams.length );
	var urlObject;

	if ( urlParams !== '' ) {
		urlObject = JSON.parse('{"' + decodeURI(urlParams).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
	}
	else {
		return dataBase[ endpoint ];
	}

	var data = dataBase[endpoint];

	console.log('->', urlParams, urlObject, endpoint );

	var resp = [];
	var item;
	for( var key in urlObject ) {
		for( var i=0; i<data.length; i++) {
			console.log( key, urlObject[ key ], data[i][ key ] );
			if ( urlObject[ key ] === String( data[i][ key ] ) ) {
				resp.push( item );
			}
		};
	}
	return resp;


// 	return
//   var data = {
//     guide_booking: [
//       {
//         id: '1',
//         date: '2018-09-25',
//         time: '19:00:00',
//         time_length: '0',
//         restaurant_booking_id: '1',
//         guide_id: '1',
//         booked_seats: '2'
//       },
//       {
//         id: '2',
//         date: '2018-09-25',
//         time: '21:00:00',
//         time_length: '0',
//         restaurant_booking_id: '1',
//         guide_id: '1',
//         booked_seats: '2'
//       },
//       {
//         id: '3',
//         date: '2018-09-25',
//         time: '19:00:00',
//         time_length: '0',
//         restaurant_booking_id: '1',
//         guide_id: '1',
//         booked_seats: '4'
//       },
//       {
//         id: '4',
//         date: '2018-09-26',
//         time: '19:00:00',
//         time_length: '0',
//         restaurant_booking_id: '1',
//         guide_id: '1',
//         booked_seats: '2'
//       }
//     ],
//     avail_map: function (date, restaurant) {
//       var i = 0;
//       var gb = this.guide_booking;
//       var res = [];
//       while ( gb[i] ) {
//         if ( gb[i].date >= date
//               && gb[i].date < ( date.slice( 0, 8 ) + '31' )
//               && gb[i].restaurant_booking_id === String(restaurant) ) {
//           res.push( gb[i] );
//         }
//         i++;
//       }
//       return res;
//     }
// }
}
