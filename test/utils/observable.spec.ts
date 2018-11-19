import { Observer, ObservableField } from "../../src/utils/observer";
import { SimInput } from "../mocks/sim-input";

describe( 'Observable is Observed by Observer', ()=>{

	describe ( 'for an observable of type <input />', ()=>{

		let thaiYearInput = '<input type="text" name="thaiYear" value="2568" id="test-id" placeholder="year placeholder">';
		let dateInput = '<input type="text" name="thaiYear" value="2008-08-02" id="date-id" placeholder="year placeholder">';

		interface FormFields {
			thaiYear?: number;
			dummy?: string;
		}

		let initialState: FormFields = {
			thaiYear: 0,
			dummy: ''
		}

		beforeEach(()=>{
			document.body.innerHTML = '<form>' + thaiYearInput + dateInput + '</form>';
		})

		describe( 'Observable works alone', ()=> {

			it( 'should return as string for strings containing numbers', ()=> {
				let observable = new ObservableField<string>( 'date', 'date-id', '' );
				expect( observable.value ).toBe( '2008-08-02' );
			});

			it( 'should return as numbers for numbers as numbers', ()=> {
				let observable = new ObservableField<number>( 'thaiYear', 'test-id', 0 );
				expect( observable.value ).toBe( 2568 );
			});

			it( 'should return as string for number as strings', ()=> {
				let observable = new ObservableField<string>( 'thaiYear', 'test-id', '' );
				expect( observable.value ).toBe( '2568' );
			});


			it( 'should read the input field value from observable', ()=> {
				let observable = new ObservableField<number>( 'thaiYear', 'test-id', 0 );
				expect( observable.value ).toBe( 2568 );
			});

			it( 'should write the input field with value set in observable', ()=> {
				let observable = new ObservableField<number>( 'thaiYear', 'test-id', 0 );
				observable.value = 3278;
				expect( (<HTMLInputElement>document.getElementById( 'test-id' )).value ).toBe( '3278' );
			});

			it( 'should call onchange handler in observable', ()=> {
				let mockFn = jest.fn();
				let observable = new ObservableField<number>( 'thaiYear', 'test-id', 0 );

				observable.onChange = mockFn;
				SimInput.setValue( 'test-id', '31415' );

				expect( mockFn ).toBeCalled();
				expect( (<HTMLInputElement>document.getElementById( 'test-id' )).value ).toEqual( '31415' );
				expect( observable.value ).toBe( 31415 );
			});

		});

		describe( 'Observable works with observer', ()=> {

			it( 'should read the input field value from observer', ()=> {
				let observer = new Observer<FormFields>( initialState );
				observer.registerObservable( new ObservableField<number>( 'thaiYear', 'test-id', 0 ) );

				expect( observer.state.thaiYear ).toBe( 2568 );
			});

			it( 'should write the input field with value set in observer', ()=> {
				let observer = new Observer<FormFields>( initialState );
				observer.registerObservable( new ObservableField<number>( 'thaiYear', 'test-id', 0 ) );
				observer.setState( { thaiYear: 4528 } );

				expect( (<HTMLInputElement>document.getElementById( 'test-id' )).value ).toBe( '4528' );
			});

			it( 'should call onchange handler in observer', ()=> {
				let mockFn = jest.fn();

				let observer = new Observer<FormFields>( initialState );
				observer.registerObservable( new ObservableField<number>( 'thaiYear', 'test-id', 0 ) );
				observer.observables.thaiYear.onChange = mockFn;

				expect( mockFn ).not.toHaveBeenCalled();

				SimInput.setValue( 'test-id', '31415' );

				expect( mockFn ).toHaveBeenCalled();
				expect( (<HTMLInputElement>document.getElementById( 'test-id' )).value ).toEqual( '31415' );
				expect( observer.state.thaiYear ).toBe( 31415 );
			});
	});
	});

	describe( 'Observer basic setup', ()=>{
		let thaiYearInput = '<input type="text" name="thaiYear" value="2568" id="test-id" placeholder="year placeholder">';
		let anyInput = '<input type="text" name="anyInput" value="any input" id="any-input-id" placeholder="any input placeholder">';

		interface FormFields {
			thaiYear: number;
			anyInput: string;
		}

		let initialState: FormFields = {
			thaiYear: 0,
			anyInput: ''
		}

		beforeEach(()=>{
			document.body.innerHTML = '<form>' + thaiYearInput + anyInput + '</form>';
		})

		it( 'should provide a map of observables by name', ()=>{
			let observer = new Observer<FormFields>( initialState );
			observer.registerObservable( new ObservableField<number>( 'thaiYear', 'test-id', 0 ) );
			observer.registerObservable( new ObservableField<number>( 'anyInput', 'any-input-id', 0 ) );
			expect( observer.observables.thaiYear.element ).toBe( document.getElementById( 'test-id' ) );
			expect( observer.observables['thaiYear'].element ).toBe( document.getElementById( 'test-id' ) );
		});
	});

});
