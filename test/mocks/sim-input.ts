export class SimInput {
  static setValue( element: HTMLInputElement, value: string, timeout_ms: number = 1 ): Promise<{}> {
		element.value = '';
		for( let letter of value ) {
			element.value += letter;
			let ev = new Event('input') as any;
			ev.data = element.value;
			element.dispatchEvent( ev );
		}
		element.dispatchEvent( new Event( 'change' ) );
		return new Promise(resolve =>{
			setTimeout( ()=> resolve(), timeout_ms );
		});
	}

	static getInputElementById( element: string ):HTMLInputElement {
		return < HTMLInputElement >document.getElementById( element );
	}

	static isRadioShown( element: string ) {
		let display = document.getElementById( element ).parentElement.style.display;
		return display === 'undefined' || display !== 'none';
	}
}
