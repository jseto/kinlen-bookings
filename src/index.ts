import * as jQuery from "jquery";
import { BookingFormManager } from "./frontend/booking-form-manager";

jQuery( document ).ready( function(){
  jQuery('#bookingButton').on( 'click', function() {
    openTab( 'detail-tab', 'Book Now' );
  });
	let bookingForm = jQuery('#kl-booking-form');
	if ( bookingForm.length ) {
		bookingForm.ready( ()=>{
			jQuery('#form-field-kl-booking-date').attr('autocomplete', 'off')
			setupBookingFormManager();
		});
	}
});

export async function setupBookingFormManager() {
	let postId = document.getElementById( 'kl-post-id' ).firstElementChild.firstElementChild.innerHTML
	let bookingFormManager = await new BookingFormManager()
								.registerNumericElements({
									adults: 'form-field-kl-adults',
									children: 'form-field-kl-children',
								})
								.registerStringElements({
									date: 'form-field-kl-booking-date',
									name: 'form-field-kl-name',
									email: 'form-field-kl-email',
									coupon: 'form-field-kl-coupon',
									requirements: 'form-field-kl-requirements'
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

function openTab( tabWidgetId, tabToOpen ) {
  var tabObject = jQuery( '#' + tabWidgetId );
  var activeObject =  tabObject.find( '.elementor-active' );
  if (typeof tabToOpen === 'string' || tabToOpen instanceof String) {
    tabToOpen = tabObject.find( '.elementor-tab-title' ).filter( ':contains("' + tabToOpen + '")' ).attr('data-tab');
  }
  var tabObjectToOpen = tabObject.find( "[data-tab='" + tabToOpen + "']" );
  activeObject.removeClass( 'elementor-active' );
  tabObjectToOpen.addClass('elementor-active');
  activeObject.filter('.elementor-tab-content').hide();
  tabObjectToOpen.filter('.elementor-tab-content').show();
}
