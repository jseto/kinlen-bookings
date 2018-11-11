import * as jQuery from "jquery";
import { DatePickerManager } from "./frontend/date-picker-manager";

let calendarMng;

jQuery( document ).ready( function(){
  jQuery('#bookingButton').on( 'click', function() {
    openTab( 'detail-tab', 'Book Now' );
  });
	var calendar:any = jQuery('#form-field-kl-booking-date');
	if ( calendar.flatpickr ) {
		calendar.ready( function(){
			calendarMng = new DatePickerManager( 1 );
			calendar.flatpickr({
				disableMobile: true,
			   onMonthChange: setDisabledDates,
				onOpen: setDisabledDates,
// 				onChange: dateSet
			});
		});
	}
});

function setDisabledDates( _selectedDates, _dateStr, instance ) {
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





// import * as jQuery from "jquery";
// import flatpickr from 'flatpickr';
// import { DatePickerManager } from "./frontend/date-picker-manager";
//
// jQuery( document ).ready( function(){
// 	jQuery('#bookingButton').on( 'click', function() {
// 		openTab( 'detail-tab', 'Book Now' );
// 	});
// 	let calElem = jQuery('#form-field-kl-booking-date');
// 	if ( calElem.length ) {
// 		calElem.ready(function() {
// 			// calendar({
// 			// 	disableMobile: true,
// 			// 	// onOpen: this.setDisabledDates,
// 			// 	// onMonthChange: this.setDisabledDates,
// 			// 	// onChange: enableTimeSlots
// 			//
// 			// })
// 			let calendarMng = new DatePickerManager( 1 );
// 			let calendar: any = calElem;
// 			calendar.flatpickr({
// 				onOpen: ()=>{
// 					console.log('hola');
// 				}
// 			})
// //			let calendar: () => void = calElem.
// //			calendarMng.setup( calendar.flatpickr );
// //			calendarMng.setup2( '#form-field-kl-booking-date' );
//
// 		})
// 	}
// });
// //
// // function setDisabledDates( selectedDates, dateStr, instance ) {
// // 	calendarMng.updateDates( instance );
// // }
// //
// // dateSet( selectedDates, dateStr, instance ) {
// // 	calendarMng.bookingSumary( dateStr, function( bookingSumary ) {
// // 		var time19 = $( '#form-field-kl-booking-time-0');
// // 		var time21 = $( '#form-field-kl-booking-time-1');
// //
// // 		if ( bookingSumary[ '19:00:00' ] ) {
// // 			time19.
// // 		} else {
// //
// // 		}
// // 		if ( bookingSumary[ '21:00:00' ] ) {
// //
// // 		} else {
// //
// // 		}
// //
// // 	});
// // }
//
// /**
//  * @description Opens a tab from the Elementor Tab widget
//  * @param tabWidgetId is the id of the whole Elementor Tab widget. You can
//  *                     customize in Elementor's advanced settings
//  * @param tabToOpen identifies the tab number or tab title to openTab
//  */
//
// function openTab( tabWidgetId, tabToOpen ) {
// 	var tabObject = $( '#' + tabWidgetId );
// 	var activeObject =  tabObject.find( '.elementor-active' );
// 	if (typeof tabToOpen === 'string' || tabToOpen instanceof String) {
// 		tabToOpen = tabObject.find( '.elementor-tab-title' ).filter( ':contains("' + tabToOpen + '")' ).attr('data-tab');
// 	}
// 	var tabObjectToOpen = tabObject.find( "[data-tab='" + tabToOpen + "']" );
// 	activeObject.removeClass( 'elementor-active' );
// 	tabObjectToOpen.addClass('elementor-active');
// 	activeObject.filter('.elementor-tab-content').hide();
// 	tabObjectToOpen.filter('.elementor-tab-content').show();
// }
