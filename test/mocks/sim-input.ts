export class SimInput {
  static setValue( elementId: string, value: string, timeout_ms: number = 1 ): Promise<{}> {
		let element = SimInput.getInputElementById( elementId );
		if ( element.value !== value ) {
			element.value = '';
			for( let letter of value ) {
				element.value += letter;
				let ev = new Event('input') as any;
				ev.data = element.value;
				element.dispatchEvent( ev );
			}
			element.dispatchEvent( new Event( 'change' ) );
		}
		return SimInput.delay( timeout_ms );
	}

	static check( elementId: string, checked: boolean, timeout_ms: number = 1  ) {
		let element = SimInput.getInputElementById( elementId )
		if( element.checked !== checked ) {
			element.checked = checked;
			element.dispatchEvent( new Event( 'change' ) );
		}
		return SimInput.delay( timeout_ms );
	}

	private static delay( timeout_ms: number ): Promise<{}> {
		return new Promise(resolve =>{
			setTimeout( ()=> resolve(), timeout_ms );
		});
	}

	static getInputElementById( elementId: string ):HTMLInputElement {
		return < HTMLInputElement >document.getElementById( elementId );
	}

	static isRadioShown( elementId: string ): boolean {
		let display = document.getElementById( elementId ).parentElement.style.display;
		return display === 'undefined' || display !== 'none';
	}

	static isChecked( elementId: string ): boolean {
		return this.getInputElementById( elementId ).checked;
	}

	static hasFocus( elementId: string ): boolean {
		return document.getElementById( elementId ) === document.activeElement;
	}
}
