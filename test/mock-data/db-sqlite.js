var jsonData = require('./db.json');

module.exports = mockData
var sqlite3 = require('sqlite3');
var db;

var bookingsTableName = 'wp_kinlen_booking';

function mockData(){
	return {
	 	response: function( fullURL ) {
			if ( typeof fullURL === 'undefined' )	return null;
		},
		init: function(){

			db.serialize(function() {
				db = new sqlite3.Database(':memory:');

			  db.run( 'CREATE TABLE IF NOT EXISTS ( ?\
					id int(10) NOT NULL AUTO_INCREMENT,\
					date date,\
					time time,\
					time_lenght int(10),\
					restaurant_booking_id int(10),\
					guide_id int(10),\
					booked_seats int(10),\
					PRIMARY KEY  (id)',
					bookingsTableName
				);

				var bookingData = jsonData.booking;
				// INSERT INTO table1 ( column1, column2 ,..) VALUES ( value1, value2 ,...), ( value1, value2 ,...),        ... ( value1, value2 ,...);

				var queryStr = 'INSERT INTO ' + bookingsTableName + '(';

				var keys = [];
				for( var key in bookingData[0] ) {
					keys.push( key );
				}
				queryStr += keys.join(',') + ')';

				var elements = [];
				for( var i=0; bookingData[i]; i++) {
					var values = [];
					for( var key in bookingData[i] ) {
						values.push( bookingData[i][key] );
					}
					elements.push( '(' + values.join(',') + ')' );
				}

				queryStr += 'VALUES ' + elements.join(',') + ';'
			});

			db.close();
		}
	}
}
