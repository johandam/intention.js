_Intention.module('intention/utils', 'intention/dom/selector', function(utils) {
	'use strict';

	// document.querySelectorAll support for browsers that don't have it (Stupid IE).
	// Also used as fallback for document.getElementsByClassName
	// Thanks to http://ajaxian.com/archives/creating-a-queryselector-for-ie-that-runs-at-native-speed.
	if (!document.querySelectorAll) {
		document.querySelectorAll = function fallback_querySelecterAll(query) {
			var head = document.documentElement.firstChild,
				styleTag = document.createElement('style'),
				result = [];

			head.appendChild(styleTag);

			document.__qsa_resultset__ = [];
			styleTag.styleSheet.cssText = query + '{x:expression(document.__qsa_resultset__.push(this))}';

			// Why do we need this, to update the window or trigger something or...?
			window.scrollBy(0, 0);

			// We're done with this, so let's clean up after ourselves.
			head.removeChild(styleTag);

			// Why don't we just return the __qsa_resultset__ ?
			for (var i = 0; i < document.__qsa_resultset__; i ++) {
				result[i] = document.__qsa_resultset__[i];
			}

			return result;
		};

		document.querySelector = function(query) { return document.querySelectorAll(query)[0]; }
	}

	// getElementsByClassName support for browsers that don't have it (Stupid IE).
	// We already implemented a querySelectorAll fallback for Stupid IE, so let's just use that!
	if (!document.getElementsByClassName) {
		document.getElementsByClassName = function(query) {
			return document.querySelectorAll('.' + query);
		};
	}

	// ===== Element Selector ===== //

	return {
		/**
		 * Returns all DOM elements matching the query inside the scope
		 *
		 * @method select
		 *
		 * @param {String]} query Represents the query
		 * @param {Object} scope Optional DOM Element representing the scope, defaults to document
		 *
		 * @return {Array} The DOM Elements matched
		 */
		select:function select(query, scope) {
			scope = (scope || document);

			// fetching id's, no need to use a slow method like querySelectorAll to fetch ID's
			if (/^#[a-z0-9_-]+$/i.test(query)) {
				var element = scope.getElementById(query.substr(1));
				if (element) {
					// Normalize return values, always return array(-ish) objects.
					return [element];
				}
			}

			// fetching classes, no need to use a slow method like querySelectorAll to fetch Classes
			// (unless we're running on Stupid IE that doesn't has getElementsByClassName)
			else if (/^\.[a-z0-9_-]+$/i.test(query)) {
				return scope.getElementsByClassName(query.substr(1));
			}

			// fetching tags, no need to use a slow method like querySelectorAll to fetch Tags
			else if (/^[a-z]+$/i.test(query)) {
				return scope.getElementsByTagName(query);
			}

			// fetching anything more complex then simple ID's, Classes or Tags
			else {
				return scope.querySelectorAll(query);
			}
		},

		/**
		 * Returns all DOM elements matching the neelde inside whatever matches haystack
		 *
		 * @method find
		 *
		 * @param {String]} query Represents the query
		 * @param {Object} scope Optional DOM Element representing the scope, defaults to document
		 *
		 * @return {Array} The DOM Elements matched
		 */
		find:function select_find(haystack, needle) {
			var parents = utils.handle(haystack),
				children = [];

			for (var i = parents.length; i --;) {
				var list = this.select(needle, parents[i]);
				for (var j = list.length; j --;) {
					children[children.length] = list[j];
				}
			}

			return children;
		},

		/**
		 * Returns the first DOM element matching the query inside the scope
		 *
		 * @method get
		 *
		 * @param {String]} query Represents the query
		 * @param {Object} scope Optional DOM Element representing the scope, defaults to document
		 *
		 * @return {Array} The DOM Elements matched
		 */
		get:function select_get(query, scope) {
			var item = this.select(query, scope);
			return (item ? item[0] : null);
		}
	};
});