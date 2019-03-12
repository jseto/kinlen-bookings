import { Utils } from "../utils/utils";

export class Affiliate {

	static set( url: URL ) {
		if ( url.searchParams.has( 'affiliate_id' ) ) {
			let id = url.searchParams.get( 'affiliate_id' );
			document.cookie = 'affiliate_id=' + id + ';max-age=' + ( 3600 * 24 * 5 );
		}
	}

	static get(): string {
		return Utils.keyValueStringToObj( document.cookie )[ 'affiliate_id' ];
	}

}
