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

	if ( endpoint === 'booking_period') {
		return monthBookings( dataBase['booking'], urlObject );
	}
	else {
		return generic( dataBase[endpoint ], urlObject );
	}
}

function generic( data, urlObject ) {
	// filter results on parameter basis
	for( var key in urlObject ) {
		data = data.filter( function( value ){
			return urlObject[ key ] === String( value[ key ] );
		});
	}
	return data;
}

function monthBookings( data, urlObject ) {
	// filter results on parameter basis
	data = data.filter( function( value ){
		return ( value.date >= urlObject.minDate ) && ( value.date <= urlObject.maxDate );
	});
	delete urlObject.minDate;
	delete urlObject.maxDate;
	return generic( data, urlObject );
}
