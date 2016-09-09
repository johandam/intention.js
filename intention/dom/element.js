_Intention.module(['intention/utils'], 'intention/dom/element', function(utils) {
	'use strict';

	return {
		/**
		 * Get / set an attribute of the given element.
		 *
		 * @method attr
		 *
		 * @depends this.handle
		 *
		 * @param {Mixed} query	Goes through this.handle()
		 * @param {String} property
		 * @param {String} value Optional
		 *
		 * @return {Mixed} If value is given, returns boolean succes. Otherwise returns value of specified property
		 */
		attr:function Element_attr(query, property, value) {
			var list = utils.handle(query);
			if (typeof value === 'undefined') {
				if (list[0]) {
					var attribute = list[0][property];
					if (typeof attribute === 'undefined') {
						// Wait, there is no property in the element! Let's try finding it in the attributes
						attribute = list[0].getAttribute(property);
					}

					// TODO: Hoping this is the right value;
					return attribute;
				}

				return null;
			}

			for (var i = list.length; i --;) {
				if (list[i].hasAttribute(property)) {
					list[i].setAttribute(property, value);
				} else {
					list[i][property] = value;
				}
			}

			return !!list.length;
		},

		/**
	 	 * Get / set CSS style to the given element.
		 *
		 * @method style
		 *
		 * @param {Object} element
		 * @param {String} property The property to change / retrieve
		 * @param {Mixed} value, Optional, if undefined retrieves the value without altering it
		 */
		style:function Element_style(element, property, value) {
			var list = utils.handle(element);

			// Check if we should return the value instead of setting it
			if (typeof value === 'undefined') {
				if (list[0] && list[0].style[property]) {
					return list[0].style[property];
				}
				else if (list[0]) {
					console.error('Unknown property (' + property + ')');
				}
				else {
					return;
				}
			}

			// Add px to certain properties for ease of use
			if (property === 'top' || property === 'bottom' || property === 'left' || property === 'right' || property === 'width' || property === 'height') {
				if (!isNaN(value)) {
					value += 'px';
				}
			}

			// Apply properties
			for (var i = list.length; i --;) {
				list[i].style[property] = value;
			}

			return this;
		},

		/**
		 * Apply a bunch of CSS styles to an element
		 *
		 * @method css
		 *
		 * @depends this.style()
		 *
		 * @param {Object} element
		 * @param {Object} css The CSS rules to aplpy in object format
		 */
		css:function Element_css(element, css) {
			for (var property in css) {
				if (css.hasOwnProperty(property)) {
					this.style(element, property, css[property]);
				}
			}

			return this;
		},

		/**
		 * Animation element style properties, uses CSS3 transition (with prefixes), if that's not supported, no animations for you!
		 *
		 * @method animate
		 *
		 * @depends this.style()
		 *
		 * @param {[type]} element
		 * @param {Mixed} property The property to animate, can be an array(-like) object
		 * @param {Mixed} value The value to set the property to
		 * @param {Number} duration How long the animation should take in seconds, defaults to 1
		 * @param {Number} delay How long to wait before the animation starts in seconds, defaults to 0
		 * @param {String} easing What kind of easing should be used, defaults to ease-in-out
		 * @param {Function} callback Optional callback function that will be executed when the animation completes *
		 * @return {[type]}
		 */
		animate:function Element_animate(element, property, value, duration, delay, easing, callback) {
			// Make sure property is an array
			if (typeof property === 'undefined') { property = ['all']; } else if (typeof property === 'string') { property = [property]; }

			// Handle duration, if duration is a function, assume it to be the callback
			if (typeof duration === 'function') {callback = duration;
				duration = undefined;
			}

			if (typeof duration === 'number') { duration += 's'; } else if (typeof duration === 'undefined') { duration = '1s'; }

			// Handle delay, if delay is a function, assume it to be the callback
			if (typeof delay === 'function') {callback = delay;
				delay = undefined;
			}

			if (typeof delay === 'undefined') { delay = '0s'; } else if (typeof delay === 'number') { delay += 's'; }

			// Handle easing, if easing is a function, assume it to be the callback
			if (typeof easing === 'function') {callback = easing;
				easing = undefined;
			}

			if (typeof easing === 'undefined') { easing = 'ease-in-out'; }

			var that = this;
			for (var i = property.length; i --;) {
				// TODO: See if I can switch this with this.css();
				this.style(element, 'WebkitTransition', property[i] + ' ' + duration + ' ' + easing + ' ' + delay);
				this.style(element, 'MozTransition', property[i] + ' ' + duration + ' ' + easing + ' ' + delay);
				this.style(element, 'msTransition', property[i] + ' ' + duration + ' ' + easing + ' ' + delay);
				this.style(element, 'OTransition', property[i] + ' ' + duration + ' ' + easing + ' ' + delay);
				this.style(element, 'transition', property[i] + ' ' + duration + ' ' + easing + ' ' + delay);

				(function(prop) {
					setTimeout(function() {
						that.style(element, prop, value);
					}, 10);
				})(property[i]);
			}

			if (typeof callback === 'function') {
				setTimeout(callback, (parseInt(duration, 10) + parseInt(delay, 10)) * 1000);
			}

			return this;
		},

		// ===== this.attr() Facades ===== //
		data:function Element_attr_data(element, property, value) {
			return this.attr(element, 'data-' + property, value);
		},

		html:function Element_attr_html(element, value) {
			return this.attr(element, 'innerHTML', value);
		},

		text:function Element_attr_text(element, value) {
			return this.attr(element, 'textContent', value);
		},

		value:function Element_attr_value(element, value) {
			return this.attr(element, 'value', value);
		},

		className:function Element_attr_className(element) {
			return this.attr(element, 'className');
		},

		hasClass:function Element_attr_hasClass(element, value) {
			return (this.className(element).split(' ').indexOf(value) !== -1);
		},

		addClass:function Element_attr_addClass(element, value) {
			if (!this.hasClass(element, value)) {
				return this.attr(element, 'className', (this.className(element) + ' ' + value));
			}

			return false;
		},

		removeClass:function Element_attr_removeClass(element, value) {
			var c = this.attr(element, 'className')
			if (c) {
				return this.attr(element, 'className', c.replace(value, ''));
			}

			return null;
		},

		toggleClass:function Element_attr_toggleClass(element, value) {
			if (this.hasClass(element, value)) {
				this.removeClass(element, value);
			} else {
				this.addClass(element, value);
			}
		},

		// ===== this.style() Facades ===== //

		show:function Element_style_show(element) {
			return this.style(element, 'display', 'block');
		},

		hide:function Element_style_hide(element) {
			return this.style(element, 'display', 'none');
		},

		// ===== this.animate() Facades ===== //

		slideDown:function Element_animate_slideDown(element, duration, delay, easing, callback) {
			var list = utils.handle(element);

			for (var i = list.length; i --;) {
				var el = list[i];

				if (this.attr(el, 'offsetHeight') <= 0) {
					// No reason to animate a hidden objects, we also need to know what height to animate to
					this.css(el, {
						display:'block',
						height:'auto',
						overflowY:'hidden' // We don't want anything sneaking out
					});

					// TODO: Check for browser-compatibility, surely this has to go wrong *somewhere*
					var height = this.attr(el, 'offsetHeight');

					// Reset the height to 0 so it has the correct starting place and start animating
					this.css(el, {
						height:0,
						overflowY:'hidden' // We don't want anything sneaking out
					});

					this.animate(el, 'height', height, duration, delay, easing, callback);
				}
			}
		},

		slideUp:function Element_animate_slideUp(element, duration, delay, easing, callback) {
			var list = utils.handle(element);

			for (var i = list.length; i --;) {
				var el = list[i];

				var height = this.attr(el, 'offsetHeight'); // We can't animate anything if there is no starting point, so let's set that
				if (height > 0) {
					this.css(el, {
						height:height,
						overflowY:'hidden' // We don't want anything sneaking out
					});

					this.animate(el, 'height', 0, duration, delay, easing, callback);
				}
			}
		},

		slide:function Element_animate_slide(element, duration, delay, easing, callback) {
			// Since both functions check wether or not they are supposed to be doing something, I don't have to.
			this.slideDown(element, duration, delay, easing, callback);
			this.slideUp(element, duration, delay, easing, callback);
		}
	};
});