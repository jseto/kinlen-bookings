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
}
