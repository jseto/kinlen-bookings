import * as jQuery from "jquery";
import { DatePickerManager } from "./frontend/date-picker-manager";

jQuery( document ).ready( function(){
  jQuery('#bookingButton').on( 'click', function() {
    openTab( 'detail-tab', 'Book Now' );
  });
	let bookingForm = jQuery('#kl-booking-form');
	if ( bookingForm.length ) {
		bookingForm.ready( ()=>{
			new DatePickerManager( 1 )
				.setPeople( '#form-field-kl-adults', '#form-field-kl-children' )
				.setCalendar('#form-field-kl-booking-date')
				.addTimeOption( '19:00', '#form-field-kl-booking-time-0' )
				.addTimeOption( '21:00', '#form-field-kl-booking-time-1' );
		});
	}
});

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
