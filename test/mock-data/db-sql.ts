import * as Sql from "sql.js";
import * as jsonData from "./db.json"

export class MockData {
	readonly bookingsTable = 'booking';
	readonly testDataTable = 'mock_data_test_data';
	private _db: Sql.Database;

	constructor() {
		this._db = new Sql.Database();

		let sqlArr = [
			'CREATE TABLE IF NOT EXISTS ',
			this.testDataTable,
			' ( ',
			'id int(10), ', // NOT NULL AUTO INCREMENT, ',
			'name varchar(255), ',
			'salary int(10) ',
			');'
		];
		this._db.run( sqlArr.join('') );
		this.fillData( this.testDataTable );

		sqlArr = [
			'CREATE TABLE IF NOT EXISTS ',
			this.bookingsTable,
			' ( ',
			'id int(10), ', // NOT NULL AUTO_INCREMENT, ',
			'date date, ',
			'time time, ',
			'time_length int(10), ',
			'restaurant_booking_id int(10), ',
			'guide_id int(10), ',
			'booked_seats int(10), ',
			'PRIMARY KEY (id) ',
			');'
		]
		this._db.run( sqlArr.join('') + ';' );
		this.fillData( this.bookingsTable );
	}

	response( fullURL ){
		let urlObj = new URL( fullURL, 'http://localhost' );
		let p = urlObj.pathname;
		let tableName = p.slice( p.lastIndexOf( '/', p.length - 2 ) + 1, p.length - 1 );
		let params = {};
		urlObj.searchParams.forEach(( value, key )=>{
			params[ key ] = value;
		});

		switch ( tableName ) {
			case 'booking_period':
				return this.queryPeriod( params );
			default:
				return this.queryGeneric( tableName, params );
		}
	}

  private queryPeriod(params: {}): any {
		let whereArr = [];
		whereArr.push( 'date >= "' + params[ 'minDate' ] + '"' );
		whereArr.push( 'date <= "' + params[ 'maxDate' ] + '"' );
		delete params[ 'minDate' ];
		delete params[ 'maxDate' ];
		for ( let key in params ) {
			whereArr.push( key + '= "' + params[ key ] + '"' );
		}

		return this.query( 'booking', whereArr );
  }

	private queryGeneric( table: string, params:{} ) {
		let whereArr = [];
		for ( let key in params ) {
			whereArr.push( key + '= "' + params[ key ] + '"' );
		}

		return this.query( table, whereArr );
	}

  private query( table: string, whereArr: string[] ) {
		let sqlStr = 'SELECT * FROM ' + table;
		if ( whereArr.length ) {
			sqlStr += ' WHERE ' + whereArr.join( ' AND ' );
		}

		let resp = [];
		let s = this._db.prepare( sqlStr );
		while (s.step()) {
		  resp.push( s.getAsObject() );
		}
		s.free();
		return resp;
	}

	private fillData( tableName: string ) {
		let data = jsonData[ tableName ];

		let keys = [];
		for ( var key in data[0] ) {
			keys.push( key );
		};

		let elements = [];
		data.forEach( (element )=>{
			let values = [];
			keys.forEach( (key)=>{
				values.push( '"' + element[ key ] + '"' );
			});
			elements.push( '(' + values.join(',') + ')' );
		});

		let sqlStr = 'INSERT INTO ' + tableName +' ( ' + keys.join(', ') + ' ) ' + 'VALUES ' + elements.join(',') + ';'
		this._db.run( sqlStr );
	}

}
