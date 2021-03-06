import { DatabaseObject } from "./database-object";

export class Rest {
	private static _url = '/wp-json/kinlen/';

  static objectToQueryString( obj: Object ): string {
    return '?' + Object.keys(obj)
      .map( function(k) {
          return encodeURIComponent( k ) + '=' + encodeURIComponent( obj[ k ] );
      })
      .join('&');
  }

	static getMonthPeriod( endpoint: string, date: string, queryObject: {} ) {
		let year_month = date.slice( 0, 8 );
		let minDate = year_month + '01';
		let maxDate = year_month + '31';
		queryObject[ 'minDate' ] = minDate;
		queryObject[ 'maxDate' ] = maxDate;
		return Rest.getREST( endpoint, queryObject );
	}

	static buildList( data:any, createInstance:() => DatabaseObject ):DatabaseObject[] {
		let list: DatabaseObject[] = [];
		let i = 0;
		while ( data[i] ) {
			if ( data[i].id ) {
				let element =  createInstance();
				element.fromObject( data[i] );
				list.push( element );
			}
			i++;
		}
		return list;
	}


  static getREST( endpointCommand: string, queryObject: Object ) {
    let fullURL = Rest._url + endpointCommand + this.objectToQueryString( queryObject );
    return new Promise<any[]>( resolve => {
      fetch( fullURL ).then( resp =>{
        let data = resp.json();
        resolve( data );
      }).catch( error => {
        throw( new Error( 'Kinlen Booking System: ' + error.message ) );
      });
    });
  }

	static postREST( endpointCommand: string, dataObject: {} ) {
		let fullURL = Rest._url + endpointCommand;
		return new Promise<any[]>( resolve => {
			fetch( fullURL, {
		    method: 'POST',
		    headers: {
		      'Accept': 'application/json',
		      'Content-Type': 'application/json'
		    },
		    body: JSON.stringify( dataObject )
  		}).then( resp => {
				resolve( resp.json() );
			})
		});
	}

	static putREST( endpointCommand: string, dataObject: {} ) {
		let fullURL = Rest._url + endpointCommand;
		return new Promise( resolve => {
			fetch( fullURL, {
		    method: 'PUT',
		    headers: {
		      'Accept': 'application/json',
		      'Content-Type': 'application/json'
		    },
		    body: JSON.stringify( dataObject )
  		}).then( resp => {
				resolve( resp.json() );
			})
		});
	}

	static deleteREST( endpointCommand: string, queryObject: Object ) {
		let fullURL = Rest._url + endpointCommand + this.objectToQueryString( queryObject );
		return new Promise( resolve => {
			fetch( fullURL, {
		    method: 'DELETE',
  		}).then( resp => resolve( resp.json() ) );
		});
	}
}
