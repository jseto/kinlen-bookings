abstract class ObserverBase {
	abstract change< T >( propName: string, value: T );
}

type ObservableMap = {
  [ index: string ]: ObservableBase
};

export class Observer< StateType extends {} > extends ObserverBase{
	private _state: StateType;
	private _observables: ObservableMap;

	constructor( initialState: StateType ) {
		super();
		this._observables = {};
		this._state = initialState; //should be past with initilized values so it remembers the type
	}

	registerObservable( observable: ObservableBase ) {
		this._observables[ observable.name ] = observable.setObserver( this );
		return this;
	}

	setState( val: StateType ) {
		for ( let key in val as {} ) {
			if ( this._state[ key ] != val[ key ] ) {
				this._observables[ key ].setValue( val[ key ] );
			}
		}
	}

	get state(): StateType {
		return this._state as StateType;
	}

	change< T >( propName: string, value: T ) {
		this._state[ propName ] = value;
	}

	get observables() {
		return this._observables;
	}

}

abstract class ObservableBase {
	private _observer: ObserverBase;
	private _name;
	protected _element: HTMLElement;
	private _onChange: () => void;

	setObserver( observer: ObserverBase ) {
		this._observer = observer;
		this._change();
		return this;
	}

	get observer() {
		return this._observer;
	}

	set name( val: string ) {
		this._name = val;
	}

	get name() {
		return this._name;
	}

	get element() {
		return this._element;
	}

	set onChange( callBack: ()=>void ) {
		this._onChange = callBack;
	}

	get onChange() {
		return this._onChange;
	}

	hide() {
		this._element.style.display = 'none';
	}

	show() {
		this._element.style.display = 'block';
	}

	focus() {
		this._element.focus();
	}

	abstract setValue< T >( val: T );
	abstract getValue< T >(): T;

	protected abstract _change();
}

export abstract class Observable< T > extends ObservableBase {
	private _value: T;

	constructor( name: string, element: string, initialValue: T ) {
		super();
		this._value = initialValue; 		// to remember type
		this.name = name;
		this._element = document.getElementById( element );
		if ( !this._element ){
			throw new Error('Error: Element ' + element + ' not found' );
		}
		this._element.onchange = ()=> this._change();
	}

	set value( val: T ) {
		this.setValue( val );
	}

	get value(): T {
		return this.getValue<T>();
	}

	protected _change() {
		this._value = this.value;
		if ( this.observer ) this.observer.change( this.name, this._value );
		if ( this.onChange ) this.onChange();
	}

	protected convert<T>( val: any ): T {
		if ( typeof(this._value)==='string' ) {
//		if ( isNaN( val*2 ) && typeof( val )==='string' && val.slice ) {
			return String( val ) as any as T;
		}
		else {
			return Number( val ) as any as T;
		}
	}
}

export class ObservableField< T > extends Observable< T > {
  setValue< T >( val: T ) {
		(<HTMLInputElement>this.element ).value = String( val );
	}

	getValue< T >(): T {
		return this.convert<T>( (<HTMLInputElement>this.element ).value );
	}
}

export class ObservableRadio< T = boolean > extends Observable< T > {
	
	hide() {
		this._element.parentElement.style.display = 'none';
	}

	show() {
		this._element.parentElement.style.display = 'block';
	}

	setValue< T >( val: T ) {
		(<HTMLInputElement>this.element ).checked = val as any;
	}

	getValue< T >(): T {
		return this.convert<T>( (<HTMLInputElement>this.element ).checked );
	}
}

export class ObservableSelect< T > extends ObservableField< T > {
	setOptions( options: string[] ) {
		let select = <HTMLSelectElement>this.element;
		select.options.length = 0;
		options.forEach( (item)=>	select.insertAdjacentHTML('beforeend','<option>' + item + '</option>') );
	}
}
