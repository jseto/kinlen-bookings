import { Observer, ObservableField, ObservableRadioGroup, ObservableRadio } from "../../src/utils/observer";
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

			it( 'should read the value from observer', ()=> {
				let observer = new Observer<FormFields>( initialState );
				let year = new ObservableField<number>( 'thaiYear', 'test-id', 0 );
				observer.registerObservable( year );
				year.value = 4085;
				expect( observer.state.thaiYear ).toBe( 4085 );
			});

			it( 'should write the input field with value set in observer', ()=> {
				let observer = new Observer<FormFields>( initialState );
				let year = new ObservableField<number>( 'thaiYear', 'test-id', 0 );
				observer.registerObservable( year );
				observer.setState( { thaiYear: 4528 } );

				expect( (<HTMLInputElement>document.getElementById( 'test-id' )).value ).toBe( '4528' );
				expect( year.value ).toBe( 4528 );
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

	describe( 'for an ObservableRadioGroup', ()=>{
		let group: ObservableRadioGroup;
		let radio19: ObservableRadio, radio21: ObservableRadio, radio23: ObservableRadio;
		let mockOnChange:jest.Mock;

		beforeEach(()=>{
			document.body.innerHTML = ' \
				<input type="radio" value="19:00" id="time-0" name="group[time]"/> \
				<input type="radio" value="21:00" id="time-1" name="group[time]"/> \
				<input type="radio" value="23:00" id="time-2" name="group[time]"/> \
			';

			group = new ObservableRadioGroup( 'time', '19:00' );
			radio19 = new ObservableRadio( '19:00', 'time-0' );
			radio21 = new ObservableRadio( '21:00', 'time-1' );
			radio23 = new ObservableRadio( '23:00', 'time-2' );
			group.addRadioButton( radio19 );
			group.addRadioButton( radio21 );
			group.addRadioButton( radio23 );
			mockOnChange = jest.fn();
			group.onChange = mockOnChange;
		});

		afterEach(()=>{
			mockOnChange.mockReset();
		})

		it( 'should check the radio of initial value', ()=>{
			expect( radio19.value ).toBeTruthy();
			expect( radio21.value ).toBeFalsy();
			expect( radio23.value ).toBeFalsy();
		})

		it( 'should set checked property of radioButton on set value', ()=>{
			expect( radio21.value ).toBeFalsy();
			group.value = '21:00';

			expect( radio19.value ).toBeFalsy();
			expect( radio21.value ).toBeTruthy();
			expect( radio23.value ).toBeFalsy();
			expect( mockOnChange ).toBeCalled();
		});

		it( 'should retrieve the value from a check radioButton', ()=>{
			radio19.value = false;
			radio21.value = false;
			radio23.value = true;
			expect( group.value ).toEqual( '23:00' );

			radio23.value = false;
			radio21.value = true;
			expect( group.value ).toEqual( '21:00' );
		});

		it( 'should modify only element\'s checked value of radio button when using checkRadioButton', ()=>{
			group.checkRadioButtonElements( '23:00' );
			expect( (<HTMLInputElement>radio19.element).checked ).toBeFalsy();
			expect( (<HTMLInputElement>radio21.element).checked ).toBeFalsy();
			expect( (<HTMLInputElement>radio23.element).checked ).toBeTruthy();
			expect( mockOnChange ).not.toBeCalled();
		})

		describe( 'working with observer', ()=>{
			interface RadioField {
				time: string;
			}

			let observer : Observer< RadioField >

			beforeEach(()=>{
				observer = new Observer< RadioField >({time:''});
				observer.registerObservable( group );
			});

			it( 'should set observer value on observable change', ()=>{
				expect( observer.state.time ).toEqual( '19:00' );

				radio19.value = false;
				radio21.value = false;
				radio23.value = true;
				expect( observer.state.time ).toEqual( '23:00' );
				expect( mockOnChange ).toBeCalled();
			})
		});

	})

});
