abstract class ObserverBase {
	abstract change< T >( propName: string, value: T );
}

export class Observer< StateType extends {} > extends ObserverBase{
	private _state: StateType;
	private _observables: Map< string, AnyObservable >;

	constructor() {
		super();
		this._observables = new Map< string, AnyObservable >();
		this._state = {} as StateType;//initialState;
	}

	registerObservable( observable: AnyObservable ) {
		this._observables[ observable.name ] = observable.setObserver( this );
	}

	setState( val: StateType ) {
		for ( let key in val as {} ) {
			if ( this._state[ key ] != val[ key ] ) {
				this._observables[ key ].value = val[ key ];
			}
		}
	}

	state(): StateType {
		return this._state as StateType;
	}

	change< T >( propName: string, value: T ) {
		this.state()[ propName ] = value;
	}

}

abstract class AnyObservable {
	private _observer: ObserverBase;
	private _name;

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

	protected abstract _change();
}

export abstract class Observable< T > extends AnyObservable {
	private _value: T;
	private _element: HTMLElement;
	private _onChange: () => void;

	constructor( name: string, element: string ) {
		super();
		this.name = name;
		this._element = document.getElementById( element );
		this._element.onchange = this._change;
	}

	set value( val: T ) {
		this.setValue( val );
	}

	get value(): T {
		return this.getValue<T>();
	}

	protected abstract setValue< T >( val: T );
	protected abstract getValue< T >(): T;

	set onChange( callBack: ()=>void ) {
		console.log( this )
		this._onChange = callBack;
	}

	get onChange() {
		return this._onChange;
	}

	protected get element() {
		return this._element;
	}

	protected _change() {
		console.log( this, this.onChange );
		this._value = this.value;
		this.observer.change( this.name, this._value );
		if ( this.onChange ) {
			this.onChange();
		}
	}

	protected convert<T>( val: any ): T {
		let a: T = 0 as any as T;
		if ( typeof( a ) === 'string' ) {
			return String( val ) as any as T;
		}
		else {
			return Number( val ) as any as T;
		}
	}
}

export class ObservableField< T > extends Observable< T > {
  protected setValue< T >( val: T ) {
		(<HTMLInputElement>this.element ).value = String( val );
	}

	protected getValue< T >(): T {
		return this.convert<T>( (<HTMLInputElement>this.element ).value );
	}
}
