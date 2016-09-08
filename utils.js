_Intention.module('intention/utils', function() {
	'use strict';

	var utils = {};

	/**
	 * Normalizes 'item' to an array
	 *
	 * @method handle
	 *
	 * @param {Mixed} item If given a string, retrieves the matching elements with I.select(),
	 *                     if given a function, executes it and uses it's return value as item
	 *                     if given an object, returns an array containing the object
	 *
	 * @return {Array} or array-like object
	 */
	utils.handle = function handle(item) {
		if (typeof item === 'string') {
			item = document.querySelectorAll(item);
		}

		// Since it's impossible to guess what item() will return,
		// let's set the value and continue checking.
		if (typeof item === 'function') {
			item = item();
		}

		// We do want to make sure we return an array-like object
		if (item === null || typeof item === 'undefined') {
			return [];
		}

		// We want to return an array-like object,
		// so if we are already given one, just return it.
		if (typeof item.length !== 'undefined') {
			return item;
		}

		// Normalize return values, always return array(-like) objects.
		return [item];
	};

	/**
	 * Storage class so one can easily exchange information between unrelated modules without polluting the global scope.
	 */
	utils.storage = (function() {
		// Private storage space
		var storage = {};

		return {
			/**
			 * Get item with key
			 */
			get:function storage_get(key) {
				return storage[key];
			},
			/**
			 * Set item key with value
			 */
			set:function storage_set(key, value) {
				storage[key] = value;
			},
			/**
			 * Check if item exists with key
			 */
			has:function storage_has(key) {
				return (typeof storage[key] !== 'undefined');
			}
		};
	})();

	/**
	 * Multi-functional random function
	 *
	 * @method random
	 *
	 * @param {Int} min Optional, the minimal number returned, defaults to 0
	 * @param {Mixed} max The maximum number returned, if an array is given becomes the length of the array
	 * @param {Int} exp Optional exponential, how many numbers behind the comma you want, defaults to 0
	 *
	 * @example random([min, ] max [, exp])
	 *
	 * @return {Number}
	 */
	utils.random = function random(min, max, exp) {
		if (typeof exp === 'undefined') { exp = 0; }

		// Reserving space for exp amount of numbers behind the comma
		var modifier = Math.pow(10, exp);

		// max is optional, if not given max becomes min and min becomes 0
		if (typeof max === 'undefined') {
			max = min;
			min = 0;
		}

		if (max instanceof Array) {
			max = max.length;
		}

		min *= modifier;
		max *= modifier;

		var result = Math.floor(Math.random() * (max - min) + min);

		return (result / modifier);
	};

	/**
	 * Shuffles given array
	 *
	 * @method shuffle
	 *
	 * @param {Array} array The array to shuffle
	 *
	 * @return {Array} The shuffled array
	 */
	utils.shuffle = function shuffle(array) {
		for (var j, x, i = array.length; i; j = Math.floor(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
		return array;
	};

	/**
	 * Roll a s-sided dice n amount of times
	 *
	 * @method dice
	 *
	 * @param {Int} n Amount of times to throw the dice
	 * @param {Int} s The amount of sides to the dice
	 *
	 * @return {Int}
	 */
	utils.dice = function dice(n, s) {
		var i = 0;
		while (n --) {
			i += this.random(s);
		}

		return i;
	};

	/**
	 * Returns the index of neelde in target haystack, or -1 if not present
	 *
	 * @method indexOf
	 *
	 * @param {Object} haystack Wherever you are searching in
	 * @param {Mixed} needle Whatever it is you are searching for
	 *
	 * @return {[type]}
	 */
	utils.indexOf = function indexOf(haystack, needle) {
		// TODO: Does haystack *has* to be an instance of Array? Why?
		if (typeof haystack.indexOf === 'function' && haystack instanceof Array) {
			return haystack.indexOf(needle);
		}

		for (var i in haystack) {
			if (haystack.hasOwnProperty(i)) {
				// TODO: Figure out if I prefer == over ===
				if (haystack[i] == needle) {
					return i;
				}
			}
		}

		return -1;
	};

	/**
	 * Checks if given needle is present in given haystack
	 *
	 * @method inArray
	 *
	 * @param {Mixed} needle Whatever it is you are searching for
	 * @param {Object} haystack Either a normal object or an array
	 *
	 * @return {Boolean}
	 */
	utils.inArray = function inArray(needle, haystack) {
		if (haystack instanceof Array) {
			return (this.indexOf(haystack, needle) >= 0);
		}

		else
		{
			for (var i in haystack) {
				if (haystack.hasOwnProperty(i)) {
					if (haystack[i] === needle) {
						return true;
					}
				}
			}
		}

		return false;
	};

	/**
	 * Fuzzy search feature
	 *
	 * @method fuzzy
	 *
	 * @param {Mixed} needle Whatever it is you are searching for
	 * @param {Object} haystack Wherever you are searching in
	 * @param {String} flags Optional, the flags to pass to the regex, defaults to 'ig'
	 *
	 * @return {Array} contains the elements found
	 */
	utils.fuzzy = function fuzzy(needle, haystack, flags) {
		if (typeof flags === 'undefined') {
			flags = 'ig';
		}

		var chars = needle.split(''),
			pattern = chars.join('.*?'),
			regex = new RegExp(pattern, flags),
			found = [];

		for (var i in haystack) {
			if (haystack.hasOwnProperty(i) && haystack[i].match(regex)) {
				found[found.length] = haystack[i];
			}
		}

		return found;
	};

	/**
	 * Checks if the given argument is a valid JSON string
	 *
	 * @method isJSON
	 *
	 * @param {string} json
	 *
	 * @return {Boolean} success
	 */
	utils.isJSON = function isJSON(json) {
		// JSON should always be a string
		if (typeof json !== 'string'){ return false; }

		try {
			// If it's json, this should work.
			JSON.parse(json);
			return true;
		} catch(exception) {
			// Guess it's not json afterall
			return false;
		}
	};

	/**
	 * Converts degrees to radians
	 *
	 * @method deg2rad
	 *
	 * @param {Number} degrees
	 *
	 * @return {Number} radians
	 */
	utils.deg2rad = function deg2rad(degrees) {
		return (degrees * (Math.PI / 180));
	};

	/**
	 * Converts radians to degrees
	 *
	 * @method rad2deg
	 *
	 * @param {Number} radians
	 *
	 * @return {Number} degrees
	 */
	utils.rad2deg = function rad2deg(radians) {
		return (radians * (180 / Math.PI));
	};

	/**
	 * Makes a string representation of an object
	 *
	 * @method stringifyObj
	 *
	 * @param {Object} obj [description]
	 * @param {Boolean} includeProto Whether or not to include the prototype of the object
	 *
	 * @return {String} The resulting string
	 */
	utils.stringifyObj = function stringifyObj(obj, includeProto) {
		var str = '{';
		for (var key in obj) {
			if (includeProto || obj.hasOwnProperty(key)) {str += key + ':';
				if (typeof obj[key] === 'object') {
					str += stringifyObj(obj[key], includeProto);
				} else {
					// If obj[key] is a function, += will call the toString() method
					str += obj[key];
				}

				str += ',';
			}
		}

		// Get rid of the trailing comma
		if (str.length > 1) {
			str = str.slice(0, -1);
		}

		str += '}';

		return str;
	};

	/**
	 * @todo: Documentation;
	 */
	utils.sortTBody = function Uitls_sort(tbody, col, asc, intval) {
		var rows = tbody.rows,
			rlen = rows.length,
			arr = [], i, j, cells, clen;

		// fill the array with values from the table
		for (var i = 0; i < rlen; i++) {
			cells = rows[i].cells;
			clen = cells.length;

			arr[i] = [];
			for (j = 0; j < clen; j++) {
				arr[i][j] = cells[j].innerHTML;
			}
		}

		// sort the array by the specified column number (col) and order (asc)
		arr.sort(function(a, b) {
			if (!intval && (isNaN(a[col] || isNaN(b[col])))) {
				return (a[col] === b[col]) ? 0 : ((a[col] > b[col]) ? asc : -1 * asc);
			}

			return (parseInt(a[col], 10) - parseInt(b[col], 10) * asc);
		});

		for (i = 0; i < rlen; i++) {
			arr[i] = '<td>' + arr[i].join('</td><td>') + '</td>';
		}

		tbody.innerHTML = '<tr>' + arr.join('</tr><tr>') + '</tr>';

		return this;
	};

	/**
	 * Capitalize the first character of a string
	 *
	 * @method capitalize
	 *
	 * @param {String} str
	 *
	 * @return {String} STR
	 */
	utils.capitalize = function capitalize(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	};

	/**
	 * Get the angle between two coordinate points.
	 *
	 * @method getAngleBetween
	 *
	 * @param {x,y} a Object (with x,y coordinates)
	 * @param {x,y} b Object (with x,y coordinates)
	 *
	 * @return {Number} The angle between the two coordinates or False if it can't be done
	 */
	utils.getAngleBetween = function getAngleBetween(a, b) {
		// Sanity check
		if ((typeof a.x === 'undefined') || (typeof a.y === 'undefined') || (typeof b.x === 'undefined') || (typeof b.y === 'undefined')) {
			return false;
		}

		var dx = (b.x - a.x),
			dy = (b.y - a.y);

		return Math.atan2(dy, dx);
	};

	/**
	 * Get the coordinates of the mouse at the time of calling
	 *
	 * @method getMouseCoords
	 *
	 * @depends Mouse
	 *
	 * @param {Event} e Event
	 * @param {HTMLObject} element The element to base the coordinates on.
	 *
	 * @return Something
	 */
	utils.getMouseCoords = function getMouseCoords(e, element) {
		if (!e) { e = window.event; } // Stupid IE

		var totalOffsetX = 0, totalOffsetY = 0,
			elementX = 0, elementY = 0,
			currentElement = element;

		do {
			totalOffsetX += currentElement.offsetLeft;
			totalOffsetY += currentElement.offsetTop;

			currentElement = currentElement.offsetParent;
		} while (currentElement);

		elementX = (e.pageX - totalOffsetX);
		elementY = (e.pageY - totalOffsetY);

		return {x:elementX, y:elementY};
	};

	return utils;
});