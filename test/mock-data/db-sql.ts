import * as Sql from "sql.js";
import * as jsonData from "./db.json"
import * as fs from "fs"
import * as uuid from "uuid"
import { Utils } from "../../src/utils/utils";

export class MockData {
	private tablePrefix = 'wp_kinlen_';
	readonly bookingsTable = this.tablePrefix + 'booking';
	readonly testDataTable = this.tablePrefix + 'mock_data_test_data';
	readonly guideTable = this.tablePrefix + 'guide';
	readonly guideHolidaysTable = this.tablePrefix + 'guide_holiday';
	readonly restaurantHolidaysTable = this.tablePrefix + 'restaurant_holiday';
	readonly restaurantTable = this.tablePrefix + 'restaurant';
	readonly couponTable = this.tablePrefix + 'coupon';
	private _db: Sql.Database;
  private _insertStatement: string[];

	constructor() {
		this._db = new Sql.Database();
		this._insertStatement = [];

		let sqlArr = [
			'CREATE TABLE IF NOT EXISTS ',
			this.testDataTable,
			' ( ',
			'id integer primary key, ', // NOT NULL AUTO INCREMENT, ',
			'name varchar(255), ',
			'salary int(10), ',
			'paid int(1), ',
			'token varchar(255) ',
			');'
		];
		this._db.run( sqlArr.join('') );
		this.fillData( this.testDataTable );

		sqlArr = [
			'CREATE TABLE IF NOT EXISTS ',
			this.bookingsTable,
			' ( ',
			'id integer primary key, ', // NOT NULL AUTO_INCREMENT, ',
			'date date, ',
			'time time, ',
			'time_length int(10), ',
			'comment text, ',
			'restaurant_id integer, ',
			'guide_id integer, ',
			'adults int(10), ',
			'children int(10), ',
			'coupon varchar(15), ',
			'adultPrice int(10), ',
			'childrenPrice int(10), ',
			'couponValue int(10), ',
			'paidAmount int(10), ',
			'paid int(1), ',
			'name varchar(255), ',
			'email varchar(255), ',
			'paymentProvider varchar(255), ',
			'paymentId varchar(255), ',
			'currency varchar(3), ',
			'affiliateId varchar(15), ',
			'trasactionTimeStamp timestamp, ',
			'token varchar(255) ',
			');'
		]
		this._db.run( sqlArr.join('') + ';' );
		this.fillData( this.bookingsTable );

		sqlArr = [
			'CREATE TABLE IF NOT EXISTS ',
			this.guideTable,
			' ( ',
			'id integer primary key, ', // NOT NULL AUTO INCREMENT, ',
			'name varchar(255), ',
			'score int(3), ',
			'phone varchar(10), ',
			'email varchar(255), ',
			'line_id varchar(255), ',
			'paypal varchar(255), ',
			'token varchar(255) ',
			');'
		];
		this._db.run( sqlArr.join('') );
		this.fillData( this.guideTable );

		sqlArr = [
			'CREATE TABLE IF NOT EXISTS ',
			this.guideHolidaysTable,
			' ( ',
			'id integer, ', // NOT NULL
			'date date, ',
			'token varchar(255) ',
			');'
		];
		this._db.run( sqlArr.join('') );
		this.fillData( this.guideHolidaysTable );

		sqlArr = [
			'CREATE TABLE IF NOT EXISTS ',
			this.restaurantHolidaysTable,
			' ( ',
			'id integer, ', // NOT NULL
			'date date, ',
			'token varchar(255) ',
			');'
		];
		this._db.run( sqlArr.join('') );
		this.fillData( this.restaurantHolidaysTable );

		sqlArr = [
			'CREATE TABLE IF NOT EXISTS ',
			this.restaurantTable,
			' ( ',
			'id integer primary key, ', // NOT NULL
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
			'paypal varchar(255), ',
			'token varchar(255) ',
			');'
		];
		this._db.run( sqlArr.join('') );
		this.fillData( this.restaurantTable );

		sqlArr = [
			'CREATE TABLE IF NOT EXISTS ',
			this.couponTable,
			' ( ',
			'id integer primary key, ', // NOT NULL
			'code varchar(20), ',
			'validUntil date, ',
			'value int(10), ',
			'valueType varchar(10), ', //percent, absolute
			'commission int(10), ',
			'commisionistid integer, ',
			'token varchar(255) ',
			');'
		];
		this._db.run( sqlArr.join('') );
		this.fillData( this.couponTable );

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

		if ( opts.method === 'PUT' ) {
			return this.mockPUT( table, JSON.parse( opts.body ) );
		}

		if ( opts.method === 'DELETE' ) {
			return this.mockDELETE( table, params );
		}
	}

	private mockPOST( table: string, dataObject:any ) {
		if ( !dataObject.paid ) {
			let data = [];
			data.push( dataObject );
			this.insert( this.tablePrefix + table, data );
			let resp = this._db.exec( 'select last_insert_rowid();' );
			let lastRowId = resp[0].values[0][0];
			if ( lastRowId ) return this.query( this.tablePrefix + table, this.buildWhereArray( { id: lastRowId } ), false );
			else return [];
		}
		else return[];
	}

	private mockPUT( table: string, dataObject:any ) {
		if ( dataObject.token ) {
			let searchObj = {
				id: dataObject.id,
				token: dataObject.token
			}
			delete dataObject.id;
			delete dataObject.token;
			return this.update( this.tablePrefix + table, dataObject, this.buildWhereArray( searchObj ) );
		}
		else return false;
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
				return this.query( this.tablePrefix + endpoint, this.buildWhereArray( params ) );
		}
	}

	mockDELETE( endpoint: string, params: {} ) {
		if ( params[ 'token' ] ) {
    	return this.deleteRows( this.tablePrefix + endpoint, this.buildWhereArray( params ) );
		}
		else return false;
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
		maxDate.setDate( maxDate.getDate() + 1 );
		while ( currentDate < maxDate ) {
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

	private buildWhereArray( params: {} ): string[] {
		let whereArr: string[] = [];
		for ( let key in params ) {
			whereArr.push( key + '= "' + params[ key ] + '"' );
		}
		return whereArr;
	}

  private query( table: string, whereArr: string[], removeToken: boolean = true ) {
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
		if ( removeToken ) {
			resp.forEach((row)=> delete row.token );
		}
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
			values.push( '"' + uuid.v4() + '"' );
			elements.push( '(' + values.join(',') + ')' );
		});
		keys.push( 'token' );

		let sqlStr = 'INSERT INTO ' + tableName +' ( ' + keys.join(', ') + ' ) ' + 'VALUES ' + elements.join(',') + ';'
		this._insertStatement.push( sqlStr );
		this._db.run( sqlStr );
	}

	private update( table: string, data:{}, whereArr: string[] ) {
		let sqlStr = 'UPDATE ' + table + ' SET ';

		let sqlCols = []
		for( let key in data ) {
			sqlCols.push( key + ' = "' + data[ key ] + '"' );
		}
		if ( whereArr.length ) {
			sqlStr += sqlCols.join(',') + ' WHERE ' + whereArr.join( ' AND ');
			this._db.run( sqlStr );
			return true;
		}
		else return false;
	}

	private deleteRows( table: string, whereArr: string[] ) {
		let sqlStr = 'DELETE FROM ' + table;
		if ( whereArr.length ) {
			sqlStr += ' WHERE ' + whereArr.join( ' AND ' );
			this._db.run( sqlStr );
			return true;
		}
		else return false;
	}

	exportDatabase() {
		let data = this._db.export();
		let buffer = Buffer.from(data);
		let dir = 'out/';
		if ( !fs.existsSync( dir ) ) {
    	fs.mkdirSync( dir );
		}
		fs.writeFileSync( dir + 'filename.sqlite', buffer );
		fs.writeFileSync( dir + 'filename.sql', this._insertStatement.join('\n') );
	}
}

if (typeof module !== 'undefined' && module.exports) {
	new MockData().exportDatabase();
}
