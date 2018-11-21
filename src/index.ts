import Flatpickr from 'flatpickr'
import { BookingFormManager, initialState } from "./frontend/booking-form-manager";

declare function flatpickr( element: HTMLElement, config:Flatpickr.Options.Options );

document.addEventListener( 'DOMContentLoaded', function () {
//  document.getElementById( 'bookingButton' ).onclick = ()=> openTab( 'detail-tab', 'Book Now' );
	let bookingForm = document.getElementById('kl-booking-form');
	if ( bookingForm ) {
		flatpickr( document.getElementById( 'form-field-kl-booking-date' ), { disableMobile: true } );
		document.getElementById('form-field-kl-booking-date').setAttribute('autocomplete', 'off');
		setupBookingFormManager();
	}
}, false );

export async function setupBookingFormManager() {
	let postId = document.getElementById( 'kl-post-id' ).firstElementChild.firstElementChild.innerHTML
	let bookingFormManager = await new BookingFormManager( initialState )
								.registerSelectElements({
									adults: 'form-field-kl-adults',
									children: 'form-field-kl-children',
								})
								.registerStringElements({
									date: 'form-field-kl-booking-date',
									name: 'form-field-kl-name',
									email: 'form-field-kl-email',
									coupon: 'form-field-kl-coupon',
									comments: 'form-field-kl-requirements'
								})
								.addTimeOption( '19:00:00', 'form-field-kl-booking-time-0' )
								.addTimeOption( '21:00:00', 'form-field-kl-booking-time-1' )
								.setCalendar( (<any>document.getElementById( 'form-field-kl-booking-date' ))._flatpickr )
	return bookingFormManager.setRestaurant( Number( postId ) );
}

/**
 * @description Opens a tab from the Elementor Tab widget
 * @param tabWidgetId is the id of the whole Elementor Tab widget. You can
 *                     customize in Elementor's advanced settings
 * @param tabToOpen identifies the tab number or tab title to openTab
 */

// function openTab( _tabWidgetId, _tabToOpen ) {
//   var tabObject = jQuery( '#' + tabWidgetId );
//   var activeObject =  tabObject.find( '.elementor-active' );
//   if (typeof tabToOpen === 'string' || tabToOpen instanceof String) {
//     tabToOpen = tabObject.find( '.elementor-tab-title' ).filter( ':contains("' + tabToOpen + '")' ).attr('data-tab');
//   }
//   var tabObjectToOpen = tabObject.find( "[data-tab='" + tabToOpen + "']" );
//   activeObject.removeClass( 'elementor-active' );
//   tabObjectToOpen.addClass('elementor-active');
//   activeObject.filter('.elementor-tab-content').hide();
//   tabObjectToOpen.filter('.elementor-tab-content').show();
// }
