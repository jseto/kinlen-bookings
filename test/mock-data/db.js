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

	var resp;

	// filter results on parameter basis
	for( var key in urlObject ) {
		data = data.filter( function( value ){
			return urlObject[ key ] === String( value[ key ] );
		});
	}

	return data;


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
