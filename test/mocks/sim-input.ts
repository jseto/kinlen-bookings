export class SimInput {
  static setValue( element: HTMLInputElement, value: string ) {
		element.value = '';
		for( let letter of value ) {
			element.value += letter;
			let ev = new Event('input') as any;
			ev.data = element.value;
			element.dispatchEvent( ev );
		}
		element.onchange(new Event('change') );
	}

	static getInputElementById( element: string ):HTMLInputElement {
		return < HTMLInputElement >document.getElementById( element );
	}

	static isRadioShown( element: string ) {
		let display = document.getElementById( element ).parentElement.style.display;
		return display === 'undefined' || display !== 'none';
	}
}
