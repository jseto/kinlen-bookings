import * as Sql from "sql.js";
import * as jsonData from "./db.json"
import * as fs from "fs"
import { Utils } from "../../src/utils/utils";

export class MockData {
	private tablePrefix = 'wp_kinlen_';
	readonly bookingsTable = this.tablePrefix + 'booking';
	readonly testDataTable = this.tablePrefix + 'mock_data_test_data';
	readonly guideTable = this.tablePrefix + 'guide';
	readonly guideHolidaysTable = this.tablePrefix + 'guide_holiday';
	readonly restaurantHolidaysTable = this.tablePrefix + 'restaurant_holiday';
	readonly restaurantTable = this.tablePrefix + 'restaurant';
	private _db: Sql.Database;
  private _insertStatement: string[];

	constructor() {
		this._db = new Sql.Database();
		this._insertStatement = [];

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
			'comment text, ',
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

		sqlArr = [
			'CREATE TABLE IF NOT EXISTS ',
			this.restaurantTable,
			' ( ',
			'id int(10), ', // NOT NULL
			'name varchar(255), ',
			'adultPrice int(10), ',
			'childrenPrice int(10), ',
			'description text, ',
			'excerpt varchar(255), ',
			'services varchar(255), ',
			'foodTypes varchar(255), ',
			'dishSpecials varchar(255), ',
			'valoration float(2,2), ',
			'numberOfReviews int(10), ',
			'includes varchar(255), ',
			'excludes varchar(255), ',
			'phone varchar(255), ',
			'staffNames varchar(255), ',
			'address varchar(255), ',
			'googleMaps varchar(255), ',
			'images varchar(255), ',
			'paypal varchar(255) ',
			');'
		];
		this._db.run( sqlArr.join('') );
		this.fillData( this.restaurantTable );
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
		this.insert( this.tablePrefix + table, data );
		return 200;
	}

	private mockGET( endpoint: string, params: {} ) {
		switch ( endpoint ) {
			case 'booking_period':
				return this.queryPeriod( this.bookingsTable, params );
			case 'restaurant_holiday_period':
				return this.queryPeriod( this.restaurantHolidaysTable, params );
			case 'free_guide':
				return this.queryFreeGuidePeriod( params );
			default:
				return this.queryGeneric( this.tablePrefix + endpoint, params );
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

	private queryFreeGuidePeriod( params:{} ) {
		if ( params ['date'] ) {
			return this.queryFreeGuide( params );
		}

		let resp = [];
		let currentDate = new Date( params[ 'minDate' ] );
		let maxDate = new Date( params[ 'maxDate' ] );
		while ( currentDate <= maxDate ) {
			let dateStr = Utils.dateToString( currentDate );
			let obj = this.queryFreeGuide( { date: dateStr } )
			obj.date = dateStr;
			resp.push( obj );
			currentDate.setDate( currentDate.getDate() + 1 );
		}
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
		this._insertStatement.push( sqlStr );
		this._db.run( sqlStr );
	}

	exportDatabase() {
		let data = this._db.export();
		let buffer = new Buffer(data);
		let dir = 'out/';
		if ( !fs.existsSync( dir ) ) {
    	fs.mkdirSync( dir );
		}
		fs.writeFileSync( dir + 'filename.sqlite', buffer );
		fs.writeFileSync( dir + 'filename.sql', this._insertStatement.join('\n') );
//		console.log('database writen');
	}
}

if (typeof module !== 'undefined' && module.exports) {
	new MockData().exportDatabase();
}
