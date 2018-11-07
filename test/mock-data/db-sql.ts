import * as Sql from "sql.js";
import * as jsonData from "./db.json"
import * as fs from "fs"

export class MockData {
	readonly bookingsTable = 'booking';
	readonly testDataTable = 'mock_data_test_data';
	readonly guideTable = 'guide';
	readonly guideHolidaysTable = 'guide_holiday';
	readonly restaurantHolidaysTable = 'restaurant_holiday';
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
			'restaurant_id int(10), ',
			'guide_id int(10), ',
			'booked_seats int(10), ',
			'PRIMARY KEY (id) ',
			');'
		]
		this._db.run( sqlArr.join('') + ';' );
		this.fillData( this.bookingsTable );

		sqlArr = [
			'CREATE TABLE IF NOT EXISTS ',
			this.guideTable,
			' ( ',
			'id int(10), ', // NOT NULL AUTO INCREMENT, ',
			'name varchar(255), ',
			'score int(3), ',
			'phone varchar(10), ',
			'email varchar(255), ',
			'line_id varchar(255), ',
			'paypal varchar(255), ',
			'PRIMARY KEY (id) ',
			');'
		];
		this._db.run( sqlArr.join('') );
		this.fillData( this.guideTable );

		sqlArr = [
			'CREATE TABLE IF NOT EXISTS ',
			this.guideHolidaysTable,
			' ( ',
			'id int(10), ', // NOT NULL
			'date date ',
			');'
		];
		this._db.run( sqlArr.join('') );
		this.fillData( this.guideHolidaysTable );

		sqlArr = [
			'CREATE TABLE IF NOT EXISTS ',
			this.restaurantHolidaysTable,
			' ( ',
			'id int(10), ', // NOT NULL
			'date date ',
			');'
		];
		this._db.run( sqlArr.join('') );
		this.fillData( this.restaurantHolidaysTable );
	}

	close() {
    this._db.close();
  }

	response( fullURL: string, opts?: any ) {
		let urlObj = new URL( fullURL, 'http://localhost' );
		let p = urlObj.pathname;
		let table = p.slice( p.lastIndexOf( '/', p.length - 2 ) + 1, p.length - 1 );
		let params = {};
		urlObj.searchParams.forEach(( value, key )=>{
			params[ key ] = value;
		});

		if ( opts === undefined || opts.method === 'GET' ) {
			return this.mockGET( table, params );
		}

		if ( opts.method === 'POST' ) {
			return this.mockPOST( table, JSON.parse( opts.body ) );
		}
	}

	private mockPOST( table: string, dataObject:any ) {
		let data = [];
		data.push( dataObject );
		this.insert( table, data );
		return 200;
	}

	private mockGET( endpoint: string, params: {} ) {
		switch ( endpoint ) {
			case 'booking_period':
				return this.queryPeriod( this.bookingsTable, params );
			case 'restaurant_holiday_period':
				return this.queryPeriod( this.restaurantHolidaysTable, params );
			case 'free_guide':
				return this.queryFreeGuide( params );
			default:
				return this.queryGeneric( endpoint, params );
		}
	}

  private queryFreeGuide( params: {} ) {
		let sqlArr = [
			'SELECT * FROM',
			this.guideTable,
			'WHERE ( id NOT IN ( SELECT guide_id FROM',
			this.bookingsTable,
			'WHERE date =',
			'"' + params[ 'date' ] + '"',
		 	') ) AND ( id not in ( SELECT id FROM',
			this.guideHolidaysTable,
			'WHERE date =',
			'"' + params[ 'date' ] + '"',
			') ) ORDER BY score DESC;'
		];

		let s = this._db.prepare( sqlArr.join(' ') );
		s.step();
		let resp = s.getAsObject();
		s.free();
		return resp;
  }

  private queryPeriod( table: string, params: {}): any {
		let whereArr = [];
		whereArr.push( 'date >= "' + params[ 'minDate' ] + '"' );
		whereArr.push( 'date <= "' + params[ 'maxDate' ] + '"' );
		delete params[ 'minDate' ];
		delete params[ 'maxDate' ];
		for ( let key in params ) {
			whereArr.push( key + '= "' + params[ key ] + '"' );
		}

		return this.query( table, whereArr );
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

	private fillData( table: string ) {
		this.insert( table, jsonData[ table ] );
	}

	private insert( tableName: string, data: any[] ) {
		if ( !data ) return;

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

	exportDatabase() {
		let data = this._db.export();
		let buffer = new Buffer(data);
		fs.writeFileSync("out/test/mock-data/filename.sqlite", buffer);
//		console.log('database writen');
	}
}

if (typeof module !== 'undefined' && module.exports) {
	new MockData().exportDatabase();
}
