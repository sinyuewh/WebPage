/*!
 * jQuery Sly v0.9.6
 * https://github.com/Darsain/sly
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/MIT
 */

/*jshint eqeqeq: true, noempty: true, strict: true, undef: true, expr: true, smarttabs: true, browser: true */
/*global jQuery:false */

;(function($, undefined){
'use strict';

// Plugin names
var pluginName = 'sly',
	namespace = 'plugin_' + pluginName;

/**
 * Plugin class
 *
 * @class
 * @param {Element} frame DOM element of sly container
 * @param {Object}  o Object with plugin options
 */
function Plugin( frame, o ){

	// Alias for this
	var self = this,

	// Frame variables
		$frame = $(frame),
		$slidee = $frame.children().eq(0),
		frameSize = 0,
		slideeSize = 0,
		pos = {
			cur: 0,
			max: 0,
			min: 0
		},

	// Scrollbar variables
		$sb = $(o.scrollBar).eq(0),
		$handle = $sb.length ? $sb.children().eq(0) : 0,
		sbSize = 0,
		handleSize = 0,
		hPos = {
			cur: 0,
			max: 0,
			min: 0
		},

	// Pagesbar variables
		$pb = $(o.pagesBar),
		$pages = 0,
		pages = [],

	// Navigation type booleans
		basicNav = o.itemNav === 'basic',
		smartNav = o.itemNav === 'smart',
		forceCenteredNav = o.itemNav === 'forceCentered',
		centeredNav = o.itemNav === 'centered' || forceCenteredNav,
		itemNav = basicNav || smartNav || centeredNav || forceCenteredNav,

	// Other variables
		$items = 0,
		items = [],
		rel = {
			firstItem: 0,
			lastItem: 1,
			centerItem: 1,
			activeItem: -1,
			activePage: 0,
			items: 0,
			pages: 0
		},
		$scrollSource = o.scrollSource ? $( o.scrollSource ) : $frame,
		$dragSource = o.dragSource ? $( o.dragSource ) : $frame,
		$prevButton = $(o.prev),
		$nextButton = $(o.next),
		$prevPageButton = $(o.prevPage),
		$nextPageButton = $(o.nextPage),
		cycleIndex = 0,
		cycleIsPaused = 0,
		isDragging = 0,
		callbacks = {};


	/**
	 * (Re)Loading function
	 *
	 * Populates arrays, sets sizes, binds events, ...
	 *
	 * @public
	 */
	var load = this.reload = function(){

		// Local variables
		var ignoredMargin = 0,
			oldPos = $.extend({}, pos);

		// Clear cycling timeout
		clearTimeout( cycleIndex );

		// Reset global variables
		frameSize = o.horizontal ? $frame.width() : $frame.height();
		sbSize = o.horizontal ? $sb.width() : $sb.height();
		slideeSize = o.horizontal ? $slidee.outerWidth() : $slidee.outerHeight();
		$items = $slidee.children();
		items = [];
		pages = [];

		// Set position limits & relatives
		pos.min = 0;
		pos.max = slideeSize > frameSize ? slideeSize - frameSize : 0;
		rel.items = $items.length;

		// Sizes & offsets logic, but only when needed
		if( itemNav ){

			var marginStart = getPx( $items, o.horizontal ? 'marginLeft' : 'marginTop' ),
				marginEnd = getPx( $items.slice(-1), o.horizontal ? 'marginRight' : 'marginBottom' ),
				centerOffset = 0,
				paddingStart = getPx( $slidee, o.horizontal ? 'paddingLeft' : 'paddingTop' ),
				paddingEnd = getPx( $slidee, o.horizontal ? 'paddingRight' : 'paddingBottom' ),
				areFloated = $items.css('float') !== 'none';

			// Update ignored margin
			ignoredMargin = marginStart ? 0 : marginEnd;

			// Reset slideeSize
			slideeSize = 0;

			// Iterate through items
			$items.each(function(i,e){

				// Item
				var item = $(e),
					itemSize = o.horizontal ? item.outerWidth(true) : item.outerHeight(true),
					marginTop    = getPx( item, 'marginTop' ),
					marginBottom = getPx( item, 'marginBottom'),
					marginLeft   = getPx( item, 'marginLeft'),
					marginRight  = getPx( item, 'marginRight'),
					itemObj = {
						size: itemSize,
						offStart: slideeSize - ( !i || o.horizontal ? 0 : marginTop ),
						offCenter: slideeSize - Math.round( frameSize / 2 - itemSize / 2 ),
						offEnd: slideeSize - frameSize + itemSize - ( marginStart ? 0 : marginRight ),
						margins: {
							top:    marginTop,
							bottom: marginBottom,
							left:   marginLeft,
							right:  marginRight
						}
					};

				// Account for centerOffset & slidee padding
				if( !i ){
					centerOffset = -( forceCenteredNav ? Math.round( frameSize / 2 - itemSize / 2 ) : 0 ) + paddingStart;
					slideeSize += paddingStart;
				}

				// Increment slidee size for size of the active element
				slideeSize += itemSize;

				// Try to account for vertical margin collapsing in vertical mode
				// It's not bulletproof, but should work in 99% of cases
				if( !o.horizontal && !areFloated ){

					// Subtract smaller margin, but only when top margin is not 0, and this is not the first element
					if( marginBottom && marginTop && i > 0 ){
						slideeSize -= marginTop < marginBottom ? marginTop : marginBottom;
					}

				}

				// Things to be done at last item
				if( i === $items.length - 1 ){
					slideeSize += paddingEnd;
				}

				// Add item object to items array
				items.push(itemObj);

			});

			// Resize slidee
			$slidee.css( o.horizontal ? { width: slideeSize+'px' } : { height: slideeSize+'px' } );

			// Adjust slidee size for last margin
			slideeSize -= ignoredMargin;

			// Set limits
			pos.min = centerOffset;
			pos.max = forceCenteredNav ? items[items.length-1].offCenter : slideeSize > frameSize ? slideeSize - frameSize : 0;

			// Fix overflowing activeItem
			rel.activeItem >= items.length && self.activate( items.length-1 );

		}

		// Assign relative position indexes
		assignRelatives();

		// Scrollbar
		if( $handle ){

			// Stretch scrollbar handle to represent the visible area
			handleSize = o.dynamicHandle ? Math.round( sbSize * frameSize / slideeSize ) : o.horizontal ? $handle.width() : $handle.height();
			handleSize = handleSize > sbSize ? sbSize : handleSize;
			handleSize = handleSize < o.minHandleSize ? o.minHandleSize : handleSize;
			hPos.max = sbSize - handleSize;

			// Resize handle
			$handle.css( o.horizontal ? { width: handleSize+'px' } : { height: handleSize+'px' } );

		}

		// Pages
		var tempPagePos = 0,
			pagesHtml = '',
			pageIndex = 0;

		// Populate pages array
		if( forceCenteredNav ){
			pages = $.map( items, function( o ){ return o.offCenter; } );
		} else {
			while( tempPagePos - frameSize < pos.max ){

				var pagePos = tempPagePos > pos.max ? pos.max : tempPagePos;

				pages.push( pagePos );
				tempPagePos += frameSize;

				// When item navigation, and last page is smaller than half of the last item size,
				// adjust the last page position to pos.max and break the loop
				if( tempPagePos > pos.max && itemNav && pos.max - pagePos < ( items[items.length-1].size - ignoredMargin ) / 2 ){

					pages[pages.length-1] = pos.max;
					break;

				}

			}
		}

		// Pages bar
		if( $pb.length ){

			for( var i = 0; i < pages.length; i++ ){
				pagesHtml += o.pageBuilder( pageIndex++ );
			}

			// Bind page navigation, append to pagesbar, and save to $pages variable
			$pages = $(pagesHtml).bind('click.' + namespace, function(){

				self.activatePage( $pages.index(this) );

			}).appendTo( $pb.empty() );

		}

		// Bind activating to items
		$items.unbind('.' + namespace).bind('mouseup.' + namespace, function(e){

			e.which === 1 && !isDragging && self.activate( this );

		});

		// Fix overflowing
		pos.cur < pos.min && slide( pos.min );
		pos.cur > pos.max && slide( pos.max );

		// Extend relative variables object with some useful info
		rel.pages = pages.length;
		rel.slideeSize = slideeSize;
		rel.frameSize = frameSize;
		rel.sbSize = sbSize;
		rel.handleSize = handleSize;

		// Synchronize scrollbar
		syncBars(0);

		// Disable buttons
		disableButtons();

		// Automatic cycling
		if( itemNav && o.cycleBy ){

			var pauseEvents = 'mouseenter.' + namespace + ' mouseleave.' + namespace;

			// Pause on hover
			o.pauseOnHover && $frame.unbind(pauseEvents).bind(pauseEvents, function(e){

				!cycleIsPaused && self.cycle( e.type === 'mouseenter', 1 );

			});

			// Initiate cycling
			self.cycle( o.startPaused );

		}

		// Trigger :load event
		$frame.trigger( pluginName + ':load', [ $.extend({}, pos, { old: oldPos }), $items, rel ] );

	};


	/**
	 * Slide the slidee
	 *
	 * @private
	 *
	 * @param {Int} newPos New slidee position in relation to frame
	 * @param {Bool} align  Whetner to Align elements to the frame border
	 * @param {Int} speed  Animation speed in milliseconds
	 */
	function slide( newPos, align, speed ){

		speed = isNumber( speed ) ? speed : o.speed;

		// Align items
		if( align && itemNav ){

			var tempRel = getRelatives( newPos );

			if( centeredNav ){

				newPos = items[tempRel.centerItem].offCenter;
				self[ forceCenteredNav ? 'activate' : 'toCenter']( tempRel.centerItem, 1 );

			} else if( newPos > pos.min && newPos < pos.max ){

				newPos = items[tempRel.firstItem].offStart;

			}

		}

		// Fix overflowing position
		if( !isDragging || !o.elasticBounds ){
			newPos = newPos < pos.min ? pos.min : newPos;
			newPos = newPos > pos.max ? pos.max : newPos;
		}

		// Stop if position has not changed
		if( newPos === pos.cur ) {
			return;
		} else {
			pos.cur = newPos;
		}

		// Reassign relative indexes
		assignRelatives();

		// Add disabled classes
		disableButtons();

		// halt ongoing animations
		stop();

		// Trigger :move event
		!isDragging && $frame.trigger( pluginName + ':move', [ pos, $items, rel ] );

		var newProp = o.horizontal ? { left: -pos.cur+'px' } : { top: -pos.cur+'px' };

		// Slidee move
		if( speed > 16 ){

			$slidee.animate( newProp, speed, isDragging ? 'swing' : o.easing, function(e){

				// Trigger :moveEnd event
				!isDragging && $frame.trigger( pluginName + ':moveEnd', [ pos, $items, rel ] );

			});

		} else {

			$slidee.css( newProp );

			// Trigger :moveEnd event
			!isDragging && $frame.trigger( pluginName + ':moveEnd', [ pos, $items, rel ] );

		}

	}


	/**
	 * Synchronizes scrollbar & pagesbar positions with the slidee
	 *
	 * @private
	 *
	 * @param {Int} speed Animation speed for scrollbar synchronization
	 */
	function syncBars( speed ){

		// Scrollbar synchronization
		if ($handle) {

			hPos.cur = Math.round( ( pos.cur - pos.min ) / ( pos.max - pos.min ) * hPos.max );
			hPos.cur = hPos.cur < hPos.min ? hPos.min : hPos.cur > hPos.max ? hPos.max : hPos.cur;
			$handle.stop().animate( o.horizontal ? { left: hPos.cur+'px' } : { top: hPos.cur+'px' }, isNumber(speed) ? speed : o.speed, o.easing );

		}

		// Pagesbar synchronization
		syncPages();

	}


	/**
	 * Synchronizes pagesbar
	 *
	 * @private
	 */
	function syncPages(){

		if (!$pages.length) {
			return;
		}

		// Classes
		$pages.removeClass(o.activeClass).eq(rel.activePage).addClass(o.activeClass);

	}


	/**
	 * Activate previous item
	 *
	 * @public
	 */
	this.prev = function(){

		self.activate( rel.activeItem - 1 );

	};


	/**
	 * Activate next item
	 *
	 * @public
	 */
	this.next = function(){

		self.activate( rel.activeItem + 1 );

	};


	/**
	 * Activate previous page
	 *
	 * @public
	 */
	this.prevPage = function(){

		self.activatePage( rel.activePage - 1 );

	};


	/**
	 * Activate next page
	 *
	 * @public
	 */
	this.nextPage = function(){

		self.activatePage( rel.activePage + 1 );

	};


	/**
	 * Stop ongoing animations
	 *
	 * @private
	 */
	function stop(){

		$slidee.add($handle).stop();

	}


	/**
	 * Animate element or the whole slidee to the start of the frame
	 *
	 * @public
	 *
	 * @param {Element|Int} el DOM element, or index of element in items array
	 */
	this.toStart = function( el ){

		if( itemNav ){

			var index = getIndex( el );

			if( el === undefined ){

				slide( pos.min, 1 );

			} else if( index !== -1 ){

				// You can't align items to the start of the frame when centeredNav is enabled
				if (centeredNav) {
					return;
				}

				index !== -1 && slide( items[index].offStart );

			}

		} else {

			if( el === undefined ){

				slide( pos.min );

			} else {

				var $el = $slidee.find(el).eq(0);

				if( $el.length ){

					var offset = o.horizontal ? $el.offset().left - $slidee.offset().left : $el.offset().top - $slidee.offset().top;

					slide( offset );

				}

			}

		}

		syncBars();

	};


	/**
	 * Animate element or the whole slidee to the end of the frame
	 *
	 * @public
	 *
	 * @param {Element|Int} el DOM element, or index of element in items array
	 */
	this.toEnd = function( el ){

		if( itemNav ){

			var index = getIndex( el );

			if( el === undefined ){

				slide( pos.max, 1 );

			} else if( index !== -1 ){

				// You can't align items to the end of the frame when centeredNav is enabled
				if (centeredNav) {
					return;
				}

				slide( items[index].offEnd );

			}

		} else {

			if( el === undefined ){

				slide( pos.max );

			} else {

				var $el = $slidee.find(el).eq(0);

				if( $el.length ){

					var offset = o.horizontal ? $el.offset().left - $slidee.offset().left : $el.offset().top - $slidee.offset().top;

					slide( offset - frameSize + $el[o.horizontal ? 'outerWidth' : 'outerHeight']() );

				}

			}

		}

		syncBars();

	};


	/**
	 * Animate element or the whole slidee to the center of the frame
	 *
	 * @public
	 *
	 * @param {Element|Int} el DOM element, or index of element in items array
	 */
	this.toCenter = function( el ){

		if( itemNav ){

			var index = getIndex( el );

			if( el === undefined ){

				slide( Math.round( pos.max / 2 + pos.min / 2 ), 1 );

			} else if( index !== -1 ){

				slide( items[index].offCenter );
				forceCenteredNav && self.activate( index, 1 );

			}

		} else {

			if( el === undefined ){

				slide( Math.round( pos.max / 2 ) );

			} else {

				var $el = $slidee.find(el).eq(0);

				if( $el.length ){

					var offset = o.horizontal ? $el.offset().left - $slidee.offset().left : $el.offset().top - $slidee.offset().top;

					slide( offset - frameSize / 2 + $el[o.horizontal ? 'outerWidth' : 'outerHeight']() / 2 );

				}

			}


		}

		syncBars();

	};


	/**
	 * Get an index of the element
	 *
	 * @private
	 *
	 * @param {Element|Int} el DOM element, or index of element in items array
	 */
	function getIndex( el ){

		return isNumber(el) ? el < 0 ? 0 : el > items.length-1 ? items.length-1 : el : el === undefined ? -1 : $items.index( el );

	}


	/**
	 * Parse style to pixels
	 *
	 * @private
	 *
	 * @param {Object} $item jQuery object with element
	 * @param {Property} property Property to get the pixels from
	 */
	function getPx( $item, property ){

		return parseInt( $item.css( property ), 10 );

	}


	/**
	 * Activates an element
	 *
	 * Element is positioned to one of the sides of the frame, based on it's current position.
	 * If the element is close to the right frame border, it will be animated to the start of the left border,
	 * and vice versa. This helps user to navigate through the elements only by clicking on them, without
	 * the need for navigation buttons, scrolling, or keyboard arrows.
	 *
	 * @public
	 *
	 * @param {Element|Int} el DOM element, or index of element in items array
	 * @param {Bool} noReposition Activate item without repositioning it
	 */
	this.activate = function( el, noReposition ){

		if (!itemNav || el === undefined) {
			return;
		}

		var index = getIndex( el ),
			oldActive = rel.activeItem;

		// Update activeItem index
		rel.activeItem = index;

		// Add active class to the active element
		$items.removeClass(o.activeClass).eq(index).addClass(o.activeClass);

		// Trigget :active event if a new element is being activated
		index !== oldActive && $items.eq( index ).trigger( pluginName + ':active', [ $items, rel ] );

		if( !noReposition ){

			// When centeredNav is enabled, center the element
			if( centeredNav ){

				self.toCenter( index );

			// Otherwise determine where to position the element
			} else if( smartNav ) {

				// If activated element is currently on the far right side of the frame, assume that
				// user is moving forward and animate it to the start of the visible frame, and vice versa
				if (index >= rel.lastItem) {
					self.toStart(index);
				} else if (index <= rel.firstItem) {
					self.toEnd(index);
				}

			}

		}

		// Add disabled classes
		disableButtons();

	};


	/**
	 * Activates a page
	 *
	 * @public
	 *
	 * @param {Int} index Page index, starting from 0
	 */
	this.activatePage = function( index ){

		// Fix overflowing
		index = index < 0 ? 0 : index >= pages.length ? pages.length-1 : index;
		slide( pages[index], itemNav );

		syncBars();

	};


	/**
	 * Return relative positions of items based on their location within visible frame
	 *
	 * @private
	 *
	 * @param {Int} sPos Position of slidee
	 */
	function getRelatives( sPos ){

		var newRel = {},
			centerOffset = forceCenteredNav ? 0 : frameSize / 2;

		// Determine active page
		for( var p = 0; p < pages.length; p++ ){

			if( sPos >= pos.max || p === pages.length - 1 ){
				newRel.activePage = pages.length - 1;
				break;
			}

			if( sPos <= pages[p] + centerOffset ){
				newRel.activePage = p;
				break;
			}

		}

		// Relative item indexes
		if( itemNav ){

			var first  = false,
				last   = false,
				center = false;

			/* From start */
			for( var i=0; i < items.length; i++ ){

				// First item
				if (first === false && sPos <= items[i].offStart) {
					first = i;
				}

				// Centered item
				if (center === false && sPos - items[i].size / 2 <= items[i].offCenter) {
					center = i;
				}

				// Last item
				if (i === items.length - 1 || (last === false && sPos < items[i + 1].offEnd)) {
					last = i;
				}

				// Terminate if all are assigned
				if (last !== false) {
					break;
				}

			}

			// Safe assignment, just to be sure the false won't be returned
			newRel.firstItem  = isNumber( first )  ? first  : 0;
			newRel.centerItem = isNumber( center ) ? center : newRel.firstItem;
			newRel.lastItem   = isNumber( last )   ? last   : newRel.centerItem;

		}

		return newRel;

	}


	/**
	 * Assign element indexes to the relative positions
	 *
	 * @private
	 */
	function assignRelatives(){

		$.extend( rel, getRelatives( pos.cur ) );

	}


	/**
	 * Disable buttons when needed
	 *
	 * Adds disabledClass, and when the button is <button> or <input>,
	 * activates :disabled state
	 *
	 * @private
	 */
	function disableButtons(){

		// item navigation
		if( itemNav ){

			var isFirstItem = rel.activeItem === 0,
				isLastItem = rel.activeItem >= items.length-1;

			if( $prevButton.is('button,input') ){
				$prevButton.prop('disabled', isFirstItem);
			}

			if( $nextButton.is('button,input') ){
				$nextButton.prop('disabled', isLastItem);
			}

			$prevButton[ isFirstItem ? 'removeClass' : 'addClass'](o.disabledClass);
			$nextButton[ isLastItem ? 'removeClass' : 'addClass'](o.disabledClass);

		}

		// pages navigation
		if( $pages.length ){

			var isStart = pos.cur <= pos.min,
				isEnd = pos.cur >= pos.max;

			if( $prevPageButton.is('button,input') ){
				$prevPageButton.prop('disabled', isStart);
			}

			if( $nextPageButton.is('button,input') ){
				$nextPageButton.prop('disabled', isEnd);
			}

			$prevPageButton[ isStart ? 'removeClass' : 'addClass'](o.disabledClass);
			$nextPageButton[ isEnd ? 'removeClass' : 'addClass'](o.disabledClass);

		}

	}


	/**
	 * Manage cycling
	 *
	 * @public
	 *
	 * @param {Bool} pause Pass true to pause cycling
	 * @param {Bool} soft Soft pause intended for pauseOnHover - won't set cycleIsPaused variable to true
	 */
	this.cycle = function( pause, soft ){

		if (!itemNav || !o.cycleBy) {
			return;
		}

		if( !soft ){
			cycleIsPaused = !!pause;
		}

		if( pause ){

			if( cycleIndex ){

				cycleIndex = clearTimeout( cycleIndex );

				// Trigger :cyclePause event
				$frame.trigger( pluginName + ':cyclePause', [ pos, $items, rel ] );

			}

		} else {

			// Don't initiate more than one cycle
			if (cycleIndex) {
				return;
			}

			// Trigger :cycleStart event
			$frame.trigger( pluginName + ':cycleStart', [ pos, $items, rel ] );

			// Cycling loop
			(function loop(){

				if( o.cycleInterval === 0 ){
					return;
				}

				cycleIndex = setTimeout( function(){

					if( !isDragging ){
						switch( o.cycleBy ){

							case 'items':
								var nextItem = rel.activeItem >= items.length-1 ? 0 : rel.activeItem + 1;
								self.activate( nextItem );
							break;

							case 'pages':
								var nextPage = rel.activePage >= pages.length-1 ? 0 : rel.activePage + 1;
								self.activatePage( nextPage );
							break;

						}
					}

					// Trigger :cycle event
					$frame.trigger( pluginName + ':cycle', [ pos, $items, rel ] );

					// Cycle the cycle!
					loop();

				}, o.cycleInterval );

			}());

		}

	};


	/**
	 * Crossbrowser reliable way to stop default event action
	 *
	 * @private
	 *
	 * @param {Event} e Event object
	 * @param {Bool} noBubbles Cancel event bubbling
	 */
	function stopDefault( e, noBubbles ){

		var evt = e || window.event;
		evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
		noBubbles && evt.stopPropagation ? evt.stopPropagation() : evt.cancelBubble = true;

	}


	/**
	 * Updates a signle or multiple option values
	 *
	 * @param {Mixed} property Option property name that should be updated, or object with options that will extend the current one
	 * @param {Mixed} value    Option property value
	 *
	 * @public
	 */
	this.set = function( property, value ){

		if( $.isPlainObject(property) ){

			o = $.extend({}, o, property);

		} else if( typeof property === 'string' ) {

			o[property] = value;

		}

	};


	/**
	 * Destroys plugin instance and everything it created
	 *
	 * @public
	 */
	this.destroy = function(){

		// Unbind all events
		$frame.add(document).add($slidee).add($items).add($scrollSource).add($handle)
		.add($prevButton).add($nextButton).add($prevPageButton).add($nextPageButton)
		.unbind('.' + namespace);

		// Reset some styles
		$slidee.add($handle).css( o.horizontal ? { left: 0 } : { top: 0 } );

		// Remove plugin classes
		$prevButton.add($nextButton).removeClass(o.disabledClass);

		// Remove page items
		$pb.empty();

		// Remove plugin from element data storage
		$.removeData(frame, namespace);

	};


	/**
	 * Check if variable is a number
	 *
	 * @param {Mixed} n Any type of variable
	 *
	 * @return {Boolean}
	 */
	function isNumber( n ) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}


	/** Constructor */
	(function(){

		var doc = $(document),
			dragEvents = 'mousemove.' + namespace + ' mouseup.' + namespace;

		// Extend options
		o = $.extend( {}, $.fn[pluginName].defaults, o );

		// Set required styles to elements
		$frame.css({ overflow: 'hidden' }).css('position') === 'static' && $frame.css({ position: 'relative' });
		$sb.css('position') === 'static' && $sb.css({ position: 'relative' });
		$slidee.add($handle).css( o.horizontal ? { position: 'absolute', left: 0 } : { position: 'absolute', top: 0 } );

		// Load
		load();

		// Activate requested position
		itemNav ? self.activate( o.startAt ) : slide( o.startAt );

		// Sync scrollbar & pages
		syncBars();

		// Scrolling navigation
		o.scrollBy && $scrollSource.bind('DOMMouseScroll.' + namespace + ' mousewheel.' + namespace, function(e){

			// If there is no scrolling to be done, leave the default event alone
			if (pos.min === pos.max) {
				return;
			}

			stopDefault( e, 1 );

			var orgEvent = e.originalEvent,
				delta = 0,
				isForward, nextItem;

			// Old school scrollwheel delta
			if ( orgEvent.wheelDelta ){ delta = orgEvent.wheelDelta / 120; }
			if ( orgEvent.detail     ){ delta = -orgEvent.detail / 3; }

			isForward = delta < 0;

			if( itemNav ){

				nextItem = getIndex( ( centeredNav ? forceCenteredNav ? rel.activeItem : rel.centerItem : rel.firstItem ) + ( isForward ? o.scrollBy : -o.scrollBy ) );

				self[centeredNav ? forceCenteredNav ? 'activate' : 'toCenter' : 'toStart']( nextItem );

			} else {

				slide( pos.cur + ( isForward ? o.scrollBy : -o.scrollBy ) );

			}

			syncBars();

		});

		// Keyboard navigation
		o.keyboardNav && doc.bind('keydown.' + namespace, function(e){

			switch( e.keyCode || e.which ){

				// Left or Up
				case o.horizontal ? 37 : 38:

					stopDefault(e);
					o.keyboardNavByPages ? self.prevPage() : self.prev();

				break;

				// Right or Down
				case o.horizontal ? 39 : 40:

					stopDefault(e);
					o.keyboardNavByPages ? self.nextPage() : self.next();

				break;

			}

		});

		// Navigation buttons
		o.prev && $prevButton.bind('click.' + namespace, function(e){ stopDefault(e); self.prev(); });
		o.next && $nextButton.bind('click.' + namespace, function(e){ stopDefault(e); self.next(); });
		o.prevPage && $prevPageButton.bind('click.' + namespace, function(e){ stopDefault(e); self.prevPage(); });
		o.nextPage && $nextPageButton.bind('click.' + namespace, function(e){ stopDefault(e); self.nextPage(); });

		// Dragging navigation
		o.dragContent && $dragSource.bind('mousedown.' + namespace, function(e){

			// Ignore other than left mouse button
			if (e.which !== 1) {
				return;
			}

			stopDefault(e);

			var leftInit = e.clientX,
				topInit = e.clientY,
				posInit = pos.cur,
				start = +new Date(),
				srcEl = e.target,
				easeoff = 0,
				isInitialized = 0;

			// Add dragging class
			$slidee.addClass(o.draggedClass);

			// Stop potential ongoing animations
			stop();

			// Bind dragging events
			doc.bind(dragEvents, function(e){

				var released = e.type === 'mouseup',
					path = o.horizontal ? e.clientX - leftInit : e.clientY - topInit,
					newPos = posInit - path;

				// Initialized logic
				if( !isInitialized && Math.abs( path ) > 10 ){

					isInitialized = 1;

					// Trigger :dragStart event
					$slidee.trigger( pluginName + ':dragStart', [ pos ] );

				}

				// Limits & Elastic bounds
				if( newPos > pos.max ){
					newPos = o.elasticBounds ? pos.max + ( newPos - pos.max ) / 6 : pos.max;
				} else if( newPos < pos.min ){
					newPos = o.elasticBounds ? pos.min + ( newPos - pos.min ) / 6 : pos.min;
				}

				// Adjust newPos with easing when content has been released
				if( released ){

					// Cleanup
					doc.unbind(dragEvents);
					$slidee.removeClass(o.draggedClass);

					// How long was the dragging
					var time = +new Date() - start;

					// Calculate swing length
					var swing = time < 300 ? Math.ceil( Math.pow( 6 / ( time / 300 ) , 2 ) * Math.abs( path ) / 120 ) : 0;
					newPos += path > 0 ? -swing : swing;

				}

				// Drag only when isInitialized
				if (!isInitialized) {
					return;
				}

				stopDefault(e);

				// Stop default click action on source element
				if( srcEl ){

					$(srcEl).bind('click.' + namespace, function stopMe(e){

						stopDefault(e,true);
						$(this).unbind('click.' + namespace, stopMe);

					});

					srcEl = 0;

				}

				// Dragging state
				isDragging = !released;

				// Animage, synch bars, & align
				slide( newPos, released, released ? o.speed : 0 );
				syncBars( released ? null : 0 );

				// Trigger :drag event
				if (isInitialized) {
					$slidee.trigger(pluginName + ':drag', [pos]);
				}

				// Trigger :dragEnd event
				if (released) {
					$slidee.trigger(pluginName + ':dragEnd', [pos]);
				}

			});

		});

		// Scrollbar navigation
		$handle && o.dragHandle && $handle.bind('mousedown.' + namespace, function(e){

			// Ignore other than left mouse button
			if (e.which !== 1) {
				return;
			}

			stopDefault(e);

			var leftInit = e.clientX,
				topInit = e.clientY,
				posInit = hPos.cur,
				pathMin = -hPos.cur,
				pathMax = hPos.max - hPos.cur,
				nextDrag = 0;

			// Add dragging class
			$handle.addClass(o.draggedClass);

			// Stop potential ongoing animations
			stop();

			// Bind dragging events
			doc.bind(dragEvents, function(e){

				stopDefault(e);

				var released = e.type === 'mouseup',
					path = o.horizontal ? e.clientX - leftInit : e.clientY - topInit,
					newPos = posInit + path,
					time = +new Date();

				// Dragging state
				isDragging = !released;

				// Unbind events and remove classes when released
				if( released ){

					doc.unbind(dragEvents);
					$handle.removeClass(o.draggedClass);

				}

				// Execute only moves within path limits
				if( path < pathMax+5 && path > pathMin-5 || released ){

					// Fix overflows
					hPos.cur = newPos > hPos.max ? hPos.max : newPos < hPos.min ? hPos.min : newPos;

					// Move handle
					$handle.stop().css( o.horizontal ? { left: hPos.cur+'px' } : { top: hPos.cur+'px' } );

					// Trigger :dragStart event
					if (!nextDrag) {
						$handle.trigger(pluginName + ':dragStart', [hPos]);
					}

					// Trigger :drag event
					$handle.trigger( pluginName + ':drag', [ hPos ] );

					// Trigger :dragEnd event
					if (released) {
						$handle.trigger(pluginName + ':dragEnd', [hPos]);
					}

					// Throttle sync interval -> smoother animations, lower CPU load
					if( nextDrag <= time || released || path > pathMax || path < pathMin ){

						nextDrag = time + 50;

						// Synchronize slidee position
						slide( Math.round( hPos.cur / hPos.max * ( pos.max - pos.min ) ) + pos.min, released, released ? o.speed : 50 );

					}

					// Sync pagesbar
					syncPages();

				}

			});

		});

	}());

}


// jQuery plugin extension
$.fn[pluginName] = function( options, returnInstance ){

	var method = false,
		methodArgs,
		instances = [];

	// Basic attributes logic
	if( typeof options !== 'undefined' && !$.isPlainObject( options ) ){
		method = options === false ? 'destroy' : options;
		methodArgs = arguments;
		Array.prototype.shift.call( methodArgs );
	}

	// Apply requested actions on all elements
	this.each(function( i, element ){

		// Plugin call with prevention against multiple instantiations
		var plugin = $.data( element, namespace );

		if( plugin && method ){

			// Call plugin method
			if( plugin[method] ){

				plugin[method].apply( plugin, methodArgs );

			}

		} else if( !plugin && !method ){

			// Create a new plugin object if it doesn't exist yet
			plugin =  $.data( element, namespace, new Plugin( element, options ) );

		}

		// Push plugin to instances
		instances.push( plugin );

	});

	// Return chainable jQuery object, or plugin instance(s)
	return returnInstance && !method ? instances.length > 1 ? instances : instances[0] : this;

};


// Default options
$.fn[pluginName].defaults = {

	// Sly direction
	horizontal:      0,       // set to 1 to change the sly direction to horizontal

	// Navigation by items; when using this, `scrollBy` option scrolls by items, not pixels
	itemNav:         0,       // enable type of item based navigation. when itemNav is enabled, items snap to frame edges or frame center
	                          // itemNav also enables "item activation" functionality and methods associated with it
	                          //
	                          // itemNav can be:
	                          // ------------------------------------------------------------------------------------
	                          // basic:         items snap to edges (ideal if you don't care about "active item" functionality)
	                          // smart:         same as basic, but activated item close to, or outside of the visible edge will be positioned to the opposite edge
	                          // centered:      activated items are positioned to the center of visible frame if possible
	                          // forceCentered: active items are always centered & centered items are always active (scrolling & dragging end activates centered item)

	// Scrollbar
	scrollBar:       null,    // selector or DOM element for scrollbar container (scrollbar container should have one child element representing scrollbar handle)
	  dynamicHandle: 1,       // resizes scrollbar handle to represent the relation between hidden and visible content. set to "0" to leave it as big as CSS made it
	  dragHandle:    1,       // set to 0 to disable dragging of scrollbar handle with mouse
	  minHandleSize: 50,      // minimal height or width (depends on sly direction) of a handle in pixels

	// Pagesbar (when centerActive is enabled, every item is considered to be a page)
	pagesBar:        null,    // selector or DOM element for pages bar container
	  pageBuilder:            // function with `index` (starting at 0) as argument that returns an HTML for one item
	    function( index ){
	      return '<li>'+(index+1)+'</li>';
	    },

	// Navigation buttons
	prev:            null,    // selector or DOM element for "previous item" button ; doesn't work when `itemsNav` is disabled
	next:            null,    // selector or DOM element for "next item" button     ; doesn't work when `itemsNav` is disabled
	prevPage:        null,    // selector or DOM element for "previous page" button
	nextPage:        null,    // selector or DOM element for "next page" button

	// Automated cycling
	cycleBy:         0,       // enable automatic cycling by 'items', or 'pages'
	  cycleInterval: 5000,    // number of milliseconds between cycles
	  pauseOnHover:  1,       // pause cycling when mouse hovers over frame
	  startPaused:   0,       // set to "1" to start in paused sate. cycling can be than resumed with "cycle" method

	// Mixed options
	scrollBy:        0,       // how many pixels/items should one mouse scroll event go. leave "0" to disable mousewheel scrolling
	dragContent:     0,       // set to 1 to enable navigation by dragging the content with your mouse
	  elasticBounds: 0,       // when dragging past limits, stretch them a little bit (like on spartphones)
	speed:           300,     // animations speed
	easing:          'swing', // animations easing. build in jQuery options are "linear" and "swing". for more, install gsgd.co.uk/sandbox/jquery/easing/
	scrollSource:    null,    // selector or DOM element for catching the mouse wheel event for sly scrolling. default source is the frame
	dragSource:      null,    // selector or DOM element for catching the mouse dragging events. default source is the frame
	startAt:         0,       // starting offset in pixels or items (depends on itemsNav option)
	keyboardNav:     0,       // whether to allow navigation by keyboard arrows (left & right for horizontal, up & down for vertical)
	                          // NOTE! keyboard navigation will disable page scrolling with keyboard arrows in correspondent sly direction (vertical or horizontal)
	keyboardNavByPages: 0,    // whether the keyboard should navigate by pages instead of items (useful when not using `itemsNav` navigation)

	// Classes
	draggedClass:  'dragged', // class that will be added to scrollbar handle, or content when they are being dragged
	activeClass:   'active',  // class that will be added to the active item, or page
	disabledClass: 'disabled' // class that will be added to prev button when on start, or next button when on end

};

}(jQuery));



// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f() { log.history = log.history || []; log.history.push(arguments); if (this.console) { var args = arguments, newarr; try { args.callee = f.caller } catch (e) { }; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr); } };

// make it safe to use console.log always
(function (a) { function b() { } for (var c = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","), d; !!(d = c.pop()) ;) { a[d] = a[d] || b; } })
(function () { try { console.log(); return window.console; } catch (a) { return (window.console = {}); } }());

// Prettify
var q = null; window.PR_SHOULD_USE_CONTINUATION = !0;
(function () {
    function L(a) {
        function m(a) { var f = a.charCodeAt(0); if (f !== 92) return f; var b = a.charAt(1); return (f = r[b]) ? f : "0" <= b && b <= "7" ? parseInt(a.substring(1), 8) : b === "u" || b === "x" ? parseInt(a.substring(2), 16) : a.charCodeAt(1) } function e(a) { if (a < 32) return (a < 16 ? "\\x0" : "\\x") + a.toString(16); a = String.fromCharCode(a); if (a === "\\" || a === "-" || a === "[" || a === "]") a = "\\" + a; return a } function h(a) {
            for (var f = a.substring(1, a.length - 1).match(/\\u[\dA-Fa-f]{4}|\\x[\dA-Fa-f]{2}|\\[0-3][0-7]{0,2}|\\[0-7]{1,2}|\\[\S\s]|[^\\]/g), a =
            [], b = [], o = f[0] === "^", c = o ? 1 : 0, i = f.length; c < i; ++c) { var j = f[c]; if (/\\[bdsw]/i.test(j)) a.push(j); else { var j = m(j), d; c + 2 < i && "-" === f[c + 1] ? (d = m(f[c + 2]), c += 2) : d = j; b.push([j, d]); d < 65 || j > 122 || (d < 65 || j > 90 || b.push([Math.max(65, j) | 32, Math.min(d, 90) | 32]), d < 97 || j > 122 || b.push([Math.max(97, j) & -33, Math.min(d, 122) & -33])) } } b.sort(function (a, f) { return a[0] - f[0] || f[1] - a[1] }); f = []; j = [NaN, NaN]; for (c = 0; c < b.length; ++c) i = b[c], i[0] <= j[1] + 1 ? j[1] = Math.max(j[1], i[1]) : f.push(j = i); b = ["["]; o && b.push("^"); b.push.apply(b, a); for (c = 0; c <
            f.length; ++c) i = f[c], b.push(e(i[0])), i[1] > i[0] && (i[1] + 1 > i[0] && b.push("-"), b.push(e(i[1]))); b.push("]"); return b.join("")
        } function y(a) {
            for (var f = a.source.match(/\[(?:[^\\\]]|\\[\S\s])*]|\\u[\dA-Fa-f]{4}|\\x[\dA-Fa-f]{2}|\\\d+|\\[^\dux]|\(\?[!:=]|[()^]|[^()[\\^]+/g), b = f.length, d = [], c = 0, i = 0; c < b; ++c) { var j = f[c]; j === "(" ? ++i : "\\" === j.charAt(0) && (j = +j.substring(1)) && j <= i && (d[j] = -1) } for (c = 1; c < d.length; ++c) -1 === d[c] && (d[c] = ++t); for (i = c = 0; c < b; ++c) j = f[c], j === "(" ? (++i, d[i] === void 0 && (f[c] = "(?:")) : "\\" === j.charAt(0) &&
            (j = +j.substring(1)) && j <= i && (f[c] = "\\" + d[i]); for (i = c = 0; c < b; ++c) "^" === f[c] && "^" !== f[c + 1] && (f[c] = ""); if (a.ignoreCase && s) for (c = 0; c < b; ++c) j = f[c], a = j.charAt(0), j.length >= 2 && a === "[" ? f[c] = h(j) : a !== "\\" && (f[c] = j.replace(/[A-Za-z]/g, function (a) { a = a.charCodeAt(0); return "[" + String.fromCharCode(a & -33, a | 32) + "]" })); return f.join("")
        } for (var t = 0, s = !1, l = !1, p = 0, d = a.length; p < d; ++p) { var g = a[p]; if (g.ignoreCase) l = !0; else if (/[a-z]/i.test(g.source.replace(/\\u[\da-f]{4}|\\x[\da-f]{2}|\\[^UXux]/gi, ""))) { s = !0; l = !1; break } } for (var r =
        { b: 8, t: 9, n: 10, v: 11, f: 12, r: 13 }, n = [], p = 0, d = a.length; p < d; ++p) { g = a[p]; if (g.global || g.multiline) throw Error("" + g); n.push("(?:" + y(g) + ")") } return RegExp(n.join("|"), l ? "gi" : "g")
    } function M(a) {
        function m(a) {
            switch (a.nodeType) {
                case 1: if (e.test(a.className)) break; for (var g = a.firstChild; g; g = g.nextSibling) m(g); g = a.nodeName; if ("BR" === g || "LI" === g) h[s] = "\n", t[s << 1] = y++, t[s++ << 1 | 1] = a; break; case 3: case 4: g = a.nodeValue, g.length && (g = p ? g.replace(/\r\n?/g, "\n") : g.replace(/[\t\n\r ]+/g, " "), h[s] = g, t[s << 1] = y, y += g.length,
                t[s++ << 1 | 1] = a)
            }
        } var e = /(?:^|\s)nocode(?:\s|$)/, h = [], y = 0, t = [], s = 0, l; a.currentStyle ? l = a.currentStyle.whiteSpace : window.getComputedStyle && (l = document.defaultView.getComputedStyle(a, q).getPropertyValue("white-space")); var p = l && "pre" === l.substring(0, 3); m(a); return { a: h.join("").replace(/\n$/, ""), c: t }
    } function B(a, m, e, h) { m && (a = { a: m, d: a }, e(a), h.push.apply(h, a.e)) } function x(a, m) {
        function e(a) {
            for (var l = a.d, p = [l, "pln"], d = 0, g = a.a.match(y) || [], r = {}, n = 0, z = g.length; n < z; ++n) {
                var f = g[n], b = r[f], o = void 0, c; if (typeof b ===
                "string") c = !1; else { var i = h[f.charAt(0)]; if (i) o = f.match(i[1]), b = i[0]; else { for (c = 0; c < t; ++c) if (i = m[c], o = f.match(i[1])) { b = i[0]; break } o || (b = "pln") } if ((c = b.length >= 5 && "lang-" === b.substring(0, 5)) && !(o && typeof o[1] === "string")) c = !1, b = "src"; c || (r[f] = b) } i = d; d += f.length; if (c) { c = o[1]; var j = f.indexOf(c), k = j + c.length; o[2] && (k = f.length - o[2].length, j = k - c.length); b = b.substring(5); B(l + i, f.substring(0, j), e, p); B(l + i + j, c, C(b, c), p); B(l + i + k, f.substring(k), e, p) } else p.push(l + i, b)
            } a.e = p
        } var h = {}, y; (function () {
            for (var e = a.concat(m),
            l = [], p = {}, d = 0, g = e.length; d < g; ++d) { var r = e[d], n = r[3]; if (n) for (var k = n.length; --k >= 0;) h[n.charAt(k)] = r; r = r[1]; n = "" + r; p.hasOwnProperty(n) || (l.push(r), p[n] = q) } l.push(/[\S\s]/); y = L(l)
        })(); var t = m.length; return e
    } function u(a) {
        var m = [], e = []; a.tripleQuotedStrings ? m.push(["str", /^(?:'''(?:[^'\\]|\\[\S\s]|''?(?=[^']))*(?:'''|$)|"""(?:[^"\\]|\\[\S\s]|""?(?=[^"]))*(?:"""|$)|'(?:[^'\\]|\\[\S\s])*(?:'|$)|"(?:[^"\\]|\\[\S\s])*(?:"|$))/, q, "'\""]) : a.multiLineStrings ? m.push(["str", /^(?:'(?:[^'\\]|\\[\S\s])*(?:'|$)|"(?:[^"\\]|\\[\S\s])*(?:"|$)|`(?:[^\\`]|\\[\S\s])*(?:`|$))/,
        q, "'\"`"]) : m.push(["str", /^(?:'(?:[^\n\r'\\]|\\.)*(?:'|$)|"(?:[^\n\r"\\]|\\.)*(?:"|$))/, q, "\"'"]); a.verbatimStrings && e.push(["str", /^@"(?:[^"]|"")*(?:"|$)/, q]); var h = a.hashComments; h && (a.cStyleComments ? (h > 1 ? m.push(["com", /^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/, q, "#"]) : m.push(["com", /^#(?:(?:define|elif|else|endif|error|ifdef|include|ifndef|line|pragma|undef|warning)\b|[^\n\r]*)/, q, "#"]), e.push(["str", /^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h|[a-z]\w*)>/, q])) : m.push(["com", /^#[^\n\r]*/,
        q, "#"])); a.cStyleComments && (e.push(["com", /^\/\/[^\n\r]*/, q]), e.push(["com", /^\/\*[\S\s]*?(?:\*\/|$)/, q])); a.regexLiterals && e.push(["lang-regex", /^(?:^^\.?|[!+-]|!=|!==|#|%|%=|&|&&|&&=|&=|\(|\*|\*=|\+=|,|-=|->|\/|\/=|:|::|;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|[?@[^]|\^=|\^\^|\^\^=|{|\||\|=|\|\||\|\|=|~|break|case|continue|delete|do|else|finally|instanceof|return|throw|try|typeof)\s*(\/(?=[^*/])(?:[^/[\\]|\\[\S\s]|\[(?:[^\\\]]|\\[\S\s])*(?:]|$))+\/)/]); (h = a.types) && e.push(["typ", h]); a = ("" + a.keywords).replace(/^ | $/g,
        ""); a.length && e.push(["kwd", RegExp("^(?:" + a.replace(/[\s,]+/g, "|") + ")\\b"), q]); m.push(["pln", /^\s+/, q, " \r\n\t\xa0"]); e.push(["lit", /^@[$_a-z][\w$@]*/i, q], ["typ", /^(?:[@_]?[A-Z]+[a-z][\w$@]*|\w+_t\b)/, q], ["pln", /^[$_a-z][\w$@]*/i, q], ["lit", /^(?:0x[\da-f]+|(?:\d(?:_\d+)*\d*(?:\.\d*)?|\.\d\+)(?:e[+-]?\d+)?)[a-z]*/i, q, "0123456789"], ["pln", /^\\[\S\s]?/, q], ["pun", /^.[^\s\w"-$'./@\\`]*/, q]); return x(m, e)
    } function D(a, m) {
        function e(a) {
            switch (a.nodeType) {
                case 1: if (k.test(a.className)) break; if ("BR" === a.nodeName) h(a),
                a.parentNode && a.parentNode.removeChild(a); else for (a = a.firstChild; a; a = a.nextSibling) e(a); break; case 3: case 4: if (p) { var b = a.nodeValue, d = b.match(t); if (d) { var c = b.substring(0, d.index); a.nodeValue = c; (b = b.substring(d.index + d[0].length)) && a.parentNode.insertBefore(s.createTextNode(b), a.nextSibling); h(a); c || a.parentNode.removeChild(a) } }
            }
        } function h(a) {
            function b(a, d) { var e = d ? a.cloneNode(!1) : a, f = a.parentNode; if (f) { var f = b(f, 1), g = a.nextSibling; f.appendChild(e); for (var h = g; h; h = g) g = h.nextSibling, f.appendChild(h) } return e }
            for (; !a.nextSibling;) if (a = a.parentNode, !a) return; for (var a = b(a.nextSibling, 0), e; (e = a.parentNode) && e.nodeType === 1;) a = e; d.push(a)
        } var k = /(?:^|\s)nocode(?:\s|$)/, t = /\r\n?|\n/, s = a.ownerDocument, l; a.currentStyle ? l = a.currentStyle.whiteSpace : window.getComputedStyle && (l = s.defaultView.getComputedStyle(a, q).getPropertyValue("white-space")); var p = l && "pre" === l.substring(0, 3); for (l = s.createElement("LI") ; a.firstChild;) l.appendChild(a.firstChild); for (var d = [l], g = 0; g < d.length; ++g) e(d[g]); m === (m | 0) && d[0].setAttribute("value",
        m); var r = s.createElement("OL"); r.className = "linenums"; for (var n = Math.max(0, m - 1 | 0) || 0, g = 0, z = d.length; g < z; ++g) l = d[g], l.className = "L" + (g + n) % 10, l.firstChild || l.appendChild(s.createTextNode("\xa0")), r.appendChild(l); a.appendChild(r)
    } function k(a, m) { for (var e = m.length; --e >= 0;) { var h = m[e]; A.hasOwnProperty(h) ? window.console && console.warn("cannot override language handler %s", h) : A[h] = a } } function C(a, m) { if (!a || !A.hasOwnProperty(a)) a = /^\s*</.test(m) ? "default-markup" : "default-code"; return A[a] } function E(a) {
        var m =
        a.g; try {
            var e = M(a.h), h = e.a; a.a = h; a.c = e.c; a.d = 0; C(m, h)(a); var k = /\bMSIE\b/.test(navigator.userAgent), m = /\n/g, t = a.a, s = t.length, e = 0, l = a.c, p = l.length, h = 0, d = a.e, g = d.length, a = 0; d[g] = s; var r, n; for (n = r = 0; n < g;) d[n] !== d[n + 2] ? (d[r++] = d[n++], d[r++] = d[n++]) : n += 2; g = r; for (n = r = 0; n < g;) { for (var z = d[n], f = d[n + 1], b = n + 2; b + 2 <= g && d[b + 1] === f;) b += 2; d[r++] = z; d[r++] = f; n = b } for (d.length = r; h < p;) {
                var o = l[h + 2] || s, c = d[a + 2] || s, b = Math.min(o, c), i = l[h + 1], j; if (i.nodeType !== 1 && (j = t.substring(e, b))) {
                    k && (j = j.replace(m, "\r")); i.nodeValue =
                    j; var u = i.ownerDocument, v = u.createElement("SPAN"); v.className = d[a + 1]; var x = i.parentNode; x.replaceChild(v, i); v.appendChild(i); e < o && (l[h + 1] = i = u.createTextNode(t.substring(b, o)), x.insertBefore(i, v.nextSibling))
                } e = b; e >= o && (h += 2); e >= c && (a += 2)
            }
        } catch (w) { "console" in window && console.log(w && w.stack ? w.stack : w) }
    } var v = ["break,continue,do,else,for,if,return,while"], w = [[v, "auto,case,char,const,default,double,enum,extern,float,goto,int,long,register,short,signed,sizeof,static,struct,switch,typedef,union,unsigned,void,volatile"],
    "catch,class,delete,false,import,new,operator,private,protected,public,this,throw,true,try,typeof"], F = [w, "alignof,align_union,asm,axiom,bool,concept,concept_map,const_cast,constexpr,decltype,dynamic_cast,explicit,export,friend,inline,late_check,mutable,namespace,nullptr,reinterpret_cast,static_assert,static_cast,template,typeid,typename,using,virtual,where"], G = [w, "abstract,boolean,byte,extends,final,finally,implements,import,instanceof,null,native,package,strictfp,super,synchronized,throws,transient"],
    H = [G, "as,base,by,checked,decimal,delegate,descending,dynamic,event,fixed,foreach,from,group,implicit,in,interface,internal,into,is,lock,object,out,override,orderby,params,partial,readonly,ref,sbyte,sealed,stackalloc,string,select,uint,ulong,unchecked,unsafe,ushort,var"], w = [w, "debugger,eval,export,function,get,null,set,undefined,var,with,Infinity,NaN"], I = [v, "and,as,assert,class,def,del,elif,except,exec,finally,from,global,import,in,is,lambda,nonlocal,not,or,pass,print,raise,try,with,yield,False,True,None"],
    J = [v, "alias,and,begin,case,class,def,defined,elsif,end,ensure,false,in,module,next,nil,not,or,redo,rescue,retry,self,super,then,true,undef,unless,until,when,yield,BEGIN,END"], v = [v, "case,done,elif,esac,eval,fi,function,in,local,set,then,until"], K = /^(DIR|FILE|vector|(de|priority_)?queue|list|stack|(const_)?iterator|(multi)?(set|map)|bitset|u?(int|float)\d*)/, N = /\S/, O = u({
        keywords: [F, H, w, "caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END" +
        I, J, v], hashComments: !0, cStyleComments: !0, multiLineStrings: !0, regexLiterals: !0
    }), A = {}; k(O, ["default-code"]); k(x([], [["pln", /^[^<?]+/], ["dec", /^<!\w[^>]*(?:>|$)/], ["com", /^<\!--[\S\s]*?(?:--\>|$)/], ["lang-", /^<\?([\S\s]+?)(?:\?>|$)/], ["lang-", /^<%([\S\s]+?)(?:%>|$)/], ["pun", /^(?:<[%?]|[%?]>)/], ["lang-", /^<xmp\b[^>]*>([\S\s]+?)<\/xmp\b[^>]*>/i], ["lang-js", /^<script\b[^>]*>([\S\s]*?)(<\/script\b[^>]*>)/i], ["lang-css", /^<style\b[^>]*>([\S\s]*?)(<\/style\b[^>]*>)/i], ["lang-in.tag", /^(<\/?[a-z][^<>]*>)/i]]),
    ["default-markup", "htm", "html", "mxml", "xhtml", "xml", "xsl"]); k(x([["pln", /^\s+/, q, " \t\r\n"], ["atv", /^(?:"[^"]*"?|'[^']*'?)/, q, "\"'"]], [["tag", /^^<\/?[a-z](?:[\w-.:]*\w)?|\/?>$/i], ["atn", /^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i], ["lang-uq.val", /^=\s*([^\s"'>]*(?:[^\s"'/>]|\/(?=\s)))/], ["pun", /^[/<->]+/], ["lang-js", /^on\w+\s*=\s*"([^"]+)"/i], ["lang-js", /^on\w+\s*=\s*'([^']+)'/i], ["lang-js", /^on\w+\s*=\s*([^\s"'>]+)/i], ["lang-css", /^style\s*=\s*"([^"]+)"/i], ["lang-css", /^style\s*=\s*'([^']+)'/i], ["lang-css",
    /^style\s*=\s*([^\s"'>]+)/i]]), ["in.tag"]); k(x([], [["atv", /^[\S\s]+/]]), ["uq.val"]); k(u({ keywords: F, hashComments: !0, cStyleComments: !0, types: K }), ["c", "cc", "cpp", "cxx", "cyc", "m"]); k(u({ keywords: "null,true,false" }), ["json"]); k(u({ keywords: H, hashComments: !0, cStyleComments: !0, verbatimStrings: !0, types: K }), ["cs"]); k(u({ keywords: G, cStyleComments: !0 }), ["java"]); k(u({ keywords: v, hashComments: !0, multiLineStrings: !0 }), ["bsh", "csh", "sh"]); k(u({ keywords: I, hashComments: !0, multiLineStrings: !0, tripleQuotedStrings: !0 }),
    ["cv", "py"]); k(u({ keywords: "caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END", hashComments: !0, multiLineStrings: !0, regexLiterals: !0 }), ["perl", "pl", "pm"]); k(u({ keywords: J, hashComments: !0, multiLineStrings: !0, regexLiterals: !0 }), ["rb"]); k(u({ keywords: w, cStyleComments: !0, regexLiterals: !0 }), ["js"]); k(u({
        keywords: "all,and,by,catch,class,else,extends,false,finally,for,if,in,is,isnt,loop,new,no,not,null,of,off,on,or,return,super,then,true,try,unless,until,when,while,yes",
        hashComments: 3, cStyleComments: !0, multilineStrings: !0, tripleQuotedStrings: !0, regexLiterals: !0
    }), ["coffee"]); k(x([], [["str", /^[\S\s]+/]]), ["regex"]); window.prettyPrintOne = function (a, m, e) { var h = document.createElement("PRE"); h.innerHTML = a; e && D(h, e); E({ g: m, i: e, h: h }); return h.innerHTML }; window.prettyPrint = function (a) {
        function m() {
            for (var e = window.PR_SHOULD_USE_CONTINUATION ? l.now() + 250 : Infinity; p < h.length && l.now() < e; p++) {
                var n = h[p], k = n.className; if (k.indexOf("prettyprint") >= 0) {
                    var k = k.match(g), f, b; if (b =
                    !k) { b = n; for (var o = void 0, c = b.firstChild; c; c = c.nextSibling) var i = c.nodeType, o = i === 1 ? o ? b : c : i === 3 ? N.test(c.nodeValue) ? b : o : o; b = (f = o === b ? void 0 : o) && "CODE" === f.tagName } b && (k = f.className.match(g)); k && (k = k[1]); b = !1; for (o = n.parentNode; o; o = o.parentNode) if ((o.tagName === "pre" || o.tagName === "code" || o.tagName === "xmp") && o.className && o.className.indexOf("prettyprint") >= 0) { b = !0; break } b || ((b = (b = n.className.match(/\blinenums\b(?::(\d+))?/)) ? b[1] && b[1].length ? +b[1] : !0 : !1) && D(n, b), d = { g: k, h: n, i: b }, E(d))
                }
            } p < h.length ? setTimeout(m,
            250) : a && a()
        } for (var e = [document.getElementsByTagName("pre"), document.getElementsByTagName("code"), document.getElementsByTagName("xmp")], h = [], k = 0; k < e.length; ++k) for (var t = 0, s = e[k].length; t < s; ++t) h.push(e[k][t]); var e = q, l = Date; l.now || (l = { now: function () { return +new Date } }); var p = 0, d, g = /\blang(?:uage)?-([\w.]+)(?!\S)/; m()
    }; window.PR = {
        createSimpleLexer: x, registerLangHandler: k, sourceDecorator: u, PR_ATTRIB_NAME: "atn", PR_ATTRIB_VALUE: "atv", PR_COMMENT: "com", PR_DECLARATION: "dec", PR_KEYWORD: "kwd", PR_LITERAL: "lit",
        PR_NOCODE: "nocode", PR_PLAIN: "pln", PR_PUNCTUATION: "pun", PR_SOURCE: "src", PR_STRING: "str", PR_TAG: "tag", PR_TYPE: "typ"
    }
})();

// jQuery easing 1.3
jQuery.easing.jswing = jQuery.easing.swing;
jQuery.extend(jQuery.easing, {
    def: "easeOutQuad", swing: function (e, a, c, b, d) { return jQuery.easing[jQuery.easing.def](e, a, c, b, d) }, easeInQuad: function (e, a, c, b, d) { return b * (a /= d) * a + c }, easeOutQuad: function (e, a, c, b, d) { return -b * (a /= d) * (a - 2) + c }, easeInOutQuad: function (e, a, c, b, d) { return 1 > (a /= d / 2) ? b / 2 * a * a + c : -b / 2 * (--a * (a - 2) - 1) + c }, easeInCubic: function (e, a, c, b, d) { return b * (a /= d) * a * a + c }, easeOutCubic: function (e, a, c, b, d) { return b * ((a = a / d - 1) * a * a + 1) + c }, easeInOutCubic: function (e, a, c, b, d) {
        return 1 > (a /= d / 2) ? b / 2 * a * a * a + c :
        b / 2 * ((a -= 2) * a * a + 2) + c
    }, easeInQuart: function (e, a, c, b, d) { return b * (a /= d) * a * a * a + c }, easeOutQuart: function (e, a, c, b, d) { return -b * ((a = a / d - 1) * a * a * a - 1) + c }, easeInOutQuart: function (e, a, c, b, d) { return 1 > (a /= d / 2) ? b / 2 * a * a * a * a + c : -b / 2 * ((a -= 2) * a * a * a - 2) + c }, easeInQuint: function (e, a, c, b, d) { return b * (a /= d) * a * a * a * a + c }, easeOutQuint: function (e, a, c, b, d) { return b * ((a = a / d - 1) * a * a * a * a + 1) + c }, easeInOutQuint: function (e, a, c, b, d) { return 1 > (a /= d / 2) ? b / 2 * a * a * a * a * a + c : b / 2 * ((a -= 2) * a * a * a * a + 2) + c }, easeInSine: function (e, a, c, b, d) {
        return -b * Math.cos(a /
        d * (Math.PI / 2)) + b + c
    }, easeOutSine: function (e, a, c, b, d) { return b * Math.sin(a / d * (Math.PI / 2)) + c }, easeInOutSine: function (e, a, c, b, d) { return -b / 2 * (Math.cos(Math.PI * a / d) - 1) + c }, easeInExpo: function (e, a, c, b, d) { return 0 == a ? c : b * Math.pow(2, 10 * (a / d - 1)) + c }, easeOutExpo: function (e, a, c, b, d) { return a == d ? c + b : b * (-Math.pow(2, -10 * a / d) + 1) + c }, easeInOutExpo: function (e, a, c, b, d) { return 0 == a ? c : a == d ? c + b : 1 > (a /= d / 2) ? b / 2 * Math.pow(2, 10 * (a - 1)) + c : b / 2 * (-Math.pow(2, -10 * --a) + 2) + c }, easeInCirc: function (e, a, c, b, d) {
        return -b * (Math.sqrt(1 - (a /= d) *
        a) - 1) + c
    }, easeOutCirc: function (e, a, c, b, d) { return b * Math.sqrt(1 - (a = a / d - 1) * a) + c }, easeInOutCirc: function (e, a, c, b, d) { return 1 > (a /= d / 2) ? -b / 2 * (Math.sqrt(1 - a * a) - 1) + c : b / 2 * (Math.sqrt(1 - (a -= 2) * a) + 1) + c }, easeInElastic: function (e, a, c, b, d) { var e = 1.70158, f = 0, g = b; if (0 == a) return c; if (1 == (a /= d)) return c + b; f || (f = 0.3 * d); g < Math.abs(b) ? (g = b, e = f / 4) : e = f / (2 * Math.PI) * Math.asin(b / g); return -(g * Math.pow(2, 10 * (a -= 1)) * Math.sin((a * d - e) * 2 * Math.PI / f)) + c }, easeOutElastic: function (e, a, c, b, d) {
        var e = 1.70158, f = 0, g = b; if (0 == a) return c; if (1 ==
        (a /= d)) return c + b; f || (f = 0.3 * d); g < Math.abs(b) ? (g = b, e = f / 4) : e = f / (2 * Math.PI) * Math.asin(b / g); return g * Math.pow(2, -10 * a) * Math.sin((a * d - e) * 2 * Math.PI / f) + b + c
    }, easeInOutElastic: function (e, a, c, b, d) { var e = 1.70158, f = 0, g = b; if (0 == a) return c; if (2 == (a /= d / 2)) return c + b; f || (f = d * 0.3 * 1.5); g < Math.abs(b) ? (g = b, e = f / 4) : e = f / (2 * Math.PI) * Math.asin(b / g); return 1 > a ? -0.5 * g * Math.pow(2, 10 * (a -= 1)) * Math.sin((a * d - e) * 2 * Math.PI / f) + c : 0.5 * g * Math.pow(2, -10 * (a -= 1)) * Math.sin((a * d - e) * 2 * Math.PI / f) + b + c }, easeInBack: function (e, a, c, b, d, f) {
        void 0 ==
        f && (f = 1.70158); return b * (a /= d) * a * ((f + 1) * a - f) + c
    }, easeOutBack: function (e, a, c, b, d, f) { void 0 == f && (f = 1.70158); return b * ((a = a / d - 1) * a * ((f + 1) * a + f) + 1) + c }, easeInOutBack: function (e, a, c, b, d, f) { void 0 == f && (f = 1.70158); return 1 > (a /= d / 2) ? b / 2 * a * a * (((f *= 1.525) + 1) * a - f) + c : b / 2 * ((a -= 2) * a * (((f *= 1.525) + 1) * a + f) + 2) + c }, easeInBounce: function (e, a, c, b, d) { return b - jQuery.easing.easeOutBounce(e, d - a, 0, b, d) + c }, easeOutBounce: function (e, a, c, b, d) {
        return (a /= d) < 1 / 2.75 ? b * 7.5625 * a * a + c : a < 2 / 2.75 ? b * (7.5625 * (a -= 1.5 / 2.75) * a + 0.75) + c : a < 2.5 / 2.75 ?
        b * (7.5625 * (a -= 2.25 / 2.75) * a + 0.9375) + c : b * (7.5625 * (a -= 2.625 / 2.75) * a + 0.984375) + c
    }, easeInOutBounce: function (e, a, c, b, d) { return a < d / 2 ? 0.5 * jQuery.easing.easeInBounce(e, 2 * a, 0, b, d) + c : 0.5 * jQuery.easing.easeOutBounce(e, 2 * a - d, 0, b, d) + 0.5 * b + c }
});