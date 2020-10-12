/**
 * @title WET-BOEW Hello world plugin
 * @overview Plugin contained to show an example of how to create your custom WET plugin
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 */
( function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-bubble",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	isNotif,
	$document = wb.doc,
	daySevenInMillionSeconds = 1000 * 60 * 60 * 24 * 7, // millisecond for 7 days

	/**
	 * Initiate chat wizard bubble
	 * @method adjustBubbleMargin
	 * @param {jQuery DOM element} $selector Element which is the actual bubble
	 */
	adjustBubbleMargin = function( $selector ) {

		var $footer = $( "#wb-info" );

		// Hide basic form on load, show chat bubble instead
		$selector.fadeIn( "slow" );

		// Ensure that the bubble does not go passed the footer
		if ( $footer.length ) {

			// Add some white space over the footer for the bubble to sit
			$footer.addClass( componentName + "-mrgn" );

			// Keep the bubble sticky while scrolling Y until user reaches the footer
			var stickyUntilFooter = function( $element ) {

			// Equals to bubble default bottom value in CSS
				var bottomY = $( "main p" ).eq( 0 ).height() || 30;
				var $window = $( window );

				if ( $window .scrollTop() >= $document.outerHeight() - $window .outerHeight() - $footer.outerHeight() ) {
					$element.css( {
						bottom: ( $footer.outerHeight() - ( $document.outerHeight() - $window.outerHeight() - $window.scrollTop() ) + bottomY )
					} );
				} else {
					$element.css( {
						bottom: bottomY
					} );
				}
			};

			// Correct bubble positionning on load, on resize an on Y scroll if necessary
			stickyUntilFooter( $selector );

			$( window ).on( "resize scroll", function() {
				stickyUntilFooter( $selector );
			} );
		} else {
			$( "main" ).after( "<footer id=\"wb-info\" class=\"" + componentName + "-mrgn" + "\"></footer>" );
		}
	},


	setNotificationStatusWithExpiry = function( key, ttl ) {
		var now = new Date();
		localStorage.setItem( key, now.getTime() + ttl );
	},

	getNotificationStatusWithExpiry = function( key ) {
		var expiryTimeValue = localStorage.getItem( key );
		var now = new Date();

		// compare the expiry time of the item with the current time
		if ( now.getTime() > expiryTimeValue ) {

			// If the item is expired, delete the item from storage
			// and return null
			localStorage.removeItem( key );
			return null;
		}
		return expiryTimeValue;
	},


/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			$elm;
		if ( elm ) {
			$elm = $( elm );

			var $bubbleElm = $( "<div class='" + componentName + "-wrap'></div>" );
			$elm.wrap( $bubbleElm );

			// Get notification status to check if it is still valid after TTL
			isNotif = getNotificationStatusWithExpiry( componentName + "-notif" );

			var $notification = ( !isNotif ? "<p class=\"trans-left\">\r\n" +
			"<span class=\"notif\">" + $elm.text() + "</span>\r\n" +
			"<button class=\"notif-close\" title=\"Close notification\" aria-label=\"Close notification\" >×</button>" : "" );

			$elm.parent().append( $notification );

			// Add linke to the top page skip link.
			var list = document.getElementById( "wb-tphp" );
			if ( list ) {

				var li = document.createElement( "li" );
				li.className = "wb-slc";

				// Append the Basic HTML version link version
				if ( $elm.attr( "data-wb-doaction" ) ) {
					li.innerHTML = "<button  data-wb-doaction='" + $elm.attr( "data-wb-doaction" ) + "' class=\"wb-sl\" >" + $elm.text() + "</button>";
				}

				// Add button at the first poisiton of the li
				list.insertBefore( li, list.childNodes[ 0 ] );
			}

			// Initiate chat wizard bubble
			adjustBubbleMargin( $elm.parent() );

			// Identify that initialization has completed
			wb.ready( $elm, componentName );
		}
	};

// Open overlay from the notification message
$( ".notif", selector ).on( "click", function() {
	var $link = $( selector + "-link" );
	$link.click();
} );


// Close notification aside bubble
$( ".notif-close", selector ).on( "click", function( event ) {
	event.preventDefault();
	$( this ).parent().hide();
	selector.focus();
	// Do not show notification until 7 days
	setNotificationStatusWithExpiry( componentName + "-notif", daySevenInMillionSeconds );
} );


// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );
} )( jQuery, window, wb );
