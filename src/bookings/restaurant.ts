import {DatabaseObject} from "../database/database-object";

export class Restaurant extends DatabaseObject {
	private _name: string;
	private _adultPrice: number;
	private _childrenPrice: number;
	private _description: string;
	private _excerpt: string;
	private _services: string;
	private _foodTypes: string;
	private _dishSpecials: string;
	private _valoration: number;
	private _numberOfReviews: number;
	private _includes: string;
	private _excludes: string;
	private _phone: string;
	private _staffNames: string;
	private _address: string;
	private _googleMaps: string;
	private _images: string;
	private _paypal: string;

  _fromObject( p: any ) {
		this._name = p.name;
		this._adultPrice = p.adultPrice;
		this._childrenPrice = p.childrenPrice;
		this._description = p.description;
		this._excerpt = p.excerpt;
		this._foodTypes = p.foodTypes;
		this._services = p.services;
		this._dishSpecials = p.dishSpecials;
		this._valoration = p.valoration;
		this._numberOfReviews = p.numberOfReviews;
		this._includes = p.includes;
		this._excludes = p.excludes;
		this._phone = p.phone;
		this._staffNames = p.staffNames;
		this._address = p.address;
		this._googleMaps = p.googleMaps;
		this._images = p.images;
		this._paypal = p.paypal;
  }

  _toObject() {
    return {
			name: this._name,
			adultPrice: this._adultPrice,
			childrenPrice: this._childrenPrice,
			description: this._description,
			excerpt: this._excerpt,
			foodTypes: this._foodTypes,
			services: this._services,
			dishSpecials: this._dishSpecials,
			valoration: this._valoration,
			numberOfReviews: this._numberOfReviews,
			includes: this._includes,
			excludes: this._excludes,
			phone: this._phone,
			staffNames: this._staffNames,
			address: this._address,
			googleMaps: this._googleMaps,
			images: this._images,
			paypal: this._paypal
    };
  }

	setChildrenPrice( val: number ){
		this._childrenPrice = val;
		return this;
	}

	get childrenPrice() {
		return this._childrenPrice;
	}

	setAdultPrice( val: number ){
		this._adultPrice = val;
		return this;
	}

	get adultPrice() {
		return this._adultPrice;
	}
}
