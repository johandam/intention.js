_Intention.module('intention/extend', function() {
	'use strict';

	// Cross-browser support for getPrototypeOf method
	// Thanks to: http://ejohn.org/blog/objectgetprototypeof/
	if (typeof Object.getPrototypeOf !== 'function') {
		if (typeof String.__proto__ === 'object') {
			Object.getPrototypeOf = function(obj) {
				return obj.__proto__;
			};
		} else {
			Object.getPrototypeOf = function(obj) {
				// May break if the constructor has been tampered with
				return obj.constructor.prototype;
			};
		}
	}

	/**
	 * Extends object <child> with the capabilities of <parent> just like OOP (but different)
	 *
	 * @method extend
	 *
	 * @param {Object} child
	 * @param {Object} parent
	 */
	function extend(child, parent) {
		var obj, constructor = false;
		if (typeof parent === 'function') {
			constructor = parent;
			parent = parent.prototype;
		}

		if (Object.create) {
			try {
				obj = Object.create(parent);
			} catch(e) {
				var location = e.stack.split('@')[2];
				console.error(e.message + ' - in ' + location);
			}
		}

		// Object create is kinda what we want, so if it's not there, we will just have to mimick it
		else {
			// The wrapper function is to shut up strict mode.
			(function() {
				function F() {}
				F.prototype = parent;
				obj = new F();
			})();
		}

		if (constructor) {
			obj.constructor = constructor;
		}

		// Easier way of calling parent methods
		obj.parent = (function() {
			// We want parent() to work for grandparents aswell
			// Therefor we need to keep count where in the inheritance chain we actualy are.
			var _called = [];
			return function Intention_extend_parent(method) {
				_called[method] = (_called[method] || 0);

				// Set variables local to prevent global pollution
				var child = obj,
					proto = parent,
					inheritanceChain = _called[method],
					func, args, result;

				_called[method] ++;

				// Descent (or is it ascent?) the inheritance chain
				// To find the correct object that holds the function we want
				while (inheritanceChain --) {
					child = proto;
					proto = Object.getPrototypeOf(child);//.parent;
				}

				func = proto[method];
				if (typeof func !== 'function') {
					// Sanity check never hurt anyone
					throw 'Expected method (' + method + ') to be a function, instead got (' + typeof func + ') ' + func;
				}

				// If multiple arguments were given, let's pass those along
				if (arguments.length > 2) {
					args = Array.prototype.slice.call(arguments, 1);
					result = func.apply(this, args);
				}

				// If only one argument was given, let's use this
				// cheaper way to call the function
				else if (arguments.length === 2) {
					result = func.call(this, arguments[1]);
				}

				// If no arguments were given,
				// Let's use the cheapest call
				else {
					result = func.call(this);
				}

				// Since we're done now, let's reset this counter
				_called[method] --;

				// Oh, we might want to return this aswell
				return result;
			};
		})();

		// Easy way to define an abstract method
		obj.abstract = function obj_abstract(method) {
			extend.abstract(obj, method);
		};

		if (typeof child === 'function') {
			child.prototype = obj;
		} else {
			child.__proto__ = obj;
		}
	}

	/**
	 * JS OOP has gone too far, why on Earth would we need an abstract method? But we do!
	 *
	 * @method abstract
	 *
	 * @param {Object} receiver
	 * @param {String} method
	 */
	extend.abstract = function Intention_abstract(receiver, method) {
		if (typeof receiver === 'function') {
			receiver = receiver.prototype;
		}

		if (typeof receiver[method] === 'undefined') {
			receiver[method] = function() {
				throw 'Calling abstract method ' + method;
			};
		}
	};

	return extend;
});