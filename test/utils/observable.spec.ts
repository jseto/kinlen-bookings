import { Observer, ObservableField } from "../../src/utils/observer";
import { SimInput } from "../sim-input";

describe( 'Observable is Observed by Observer', ()=>{

	describe ( 'for an observable of type <input />', ()=>{

		let thaiYearInput = '<input type="text" name="thaiYear" value="2568" id="test-id" placeholder="year placeholder">';

		interface FormFields {
			thaiYear?: number;
			dummy?: string;
		}

		beforeEach(()=>{
			document.body.innerHTML = '<form>' + thaiYearInput + '</form>';
		})

		describe( 'Observable works alone', ()=> {

			it( 'should read the input field value from observable', ()=> {
				let observable = new ObservableField<number>( 'thaiYear', 'test-id' );
				expect( observable.value ).toBe( 2568 );
			});

			it( 'should write the input field with value set in observable', ()=> {
				let observable = new ObservableField<number>( 'thaiYear', 'test-id' );
				observable.value = 3278;
				expect( (<HTMLInputElement>document.getElementById( 'test-id' )).value ).toBe( '3278' );
			});

			it( 'should call onchange handler in observable', ()=> {
				let mockFn = jest.fn();
				let observable = new ObservableField<number>( 'thaiYear', 'test-id' );

				observable.onChange = mockFn;
				SimInput.setValue( (<HTMLInputElement>document.getElementById( 'test-id' )), '31415' );

				expect( mockFn ).toBeCalled();
				expect( (<HTMLInputElement>document.getElementById( 'test-id' )).value ).toEqual( '31415' );
				expect( observable.value ).toBe( 31415 );
			});

		});

		describe( 'Observable works with observer', ()=> {

			it( 'should read the input field value from observer', ()=> {
				let observer = new Observer<FormFields>();
				observer.registerObservable( new ObservableField<number>( 'thaiYear', 'test-id' ) );

				expect( observer.state.thaiYear ).toBe( 2568 );
			});

			it( 'should write the input field with value set in observer', ()=> {
				let observer = new Observer<FormFields>();
				observer.registerObservable( new ObservableField<number>( 'thaiYear', 'test-id' ) );
				observer.setState( { thaiYear: 4528 } );

				expect( (<HTMLInputElement>document.getElementById( 'test-id' )).value ).toBe( '4528' );
			});

			it( 'should call onchange handler in observer', ()=> {
				let mockFn = jest.fn();

				let observer = new Observer<FormFields>();
				observer.registerObservable( new ObservableField<number>( 'thaiYear', 'test-id' ) );
				observer.observables.thaiYear.onChange = mockFn;

				expect( mockFn ).not.toHaveBeenCalled();

				SimInput.setValue( (<HTMLInputElement>document.getElementById( 'test-id' )), '31415' );

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

		beforeEach(()=>{
			document.body.innerHTML = '<form>' + thaiYearInput + anyInput + '</form>';
		})

		it( 'should provide a map of observables by name', ()=>{
			let observer = new Observer<FormFields>();
			observer.registerObservable( new ObservableField<number>( 'thaiYear', 'test-id' ) );
			observer.registerObservable( new ObservableField<number>( 'anyInput', 'any-input-id' ) );
			expect( observer.observables.thaiYear.element ).toBe( document.getElementById( 'test-id' ) );
			expect( observer.observables['thaiYear'].element ).toBe( document.getElementById( 'test-id' ) );
		});
	});

});
