import * as jQuery from "jquery";
import { DatePickerManager } from "./frontend/date-picker-manager";
import flatpickr from "flatpickr";

let calendarMng;

jQuery( document ).ready( function(){
  jQuery('#bookingButton').on( 'click', function() {
    openTab( 'detail-tab', 'Book Now' );
  });
	var calendar:any = jQuery('#form-field-kl-booking-date');
	if ( calendar.flatpickr ) {
		calendar.ready( function(){
			calendarMng = new DatePickerManager( 1 );
			let config: flatpickr.Options.Options = {
				disableMobile: true,
			  onMonthChange: setDisabledDates,
				onOpen: setDisabledDates,
// 				onChange: dateSet
			}
			calendar.flatpickr( config );
		});
	}
});

function setDisabledDates( _selectedDates, _dateStr, instance: flatpickr.Instance ) {
	calendarMng.updateDates( instance );
}

// 	dateSet( selectedDates, dateStr, instance ) {
// 		calendarMng.bookingSumary( dateStr, function( bookingSumary ) {
// 			var time19 = $( '#form-field-kl-booking-time-0');
// 			var time21 = $( '#form-field-kl-booking-time-1');

// 			if ( bookingSumary[ '19:00:00' ] ) {

// 			} else {

// 			}
// 			if ( bookingSumary[ '21:00:00' ] ) {

// 			} else {

// 			}

// 		});
// 	}

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
