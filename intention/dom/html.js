_Intention.module(['intention/dom/selector', 'intention/dom/element', 'intention/utils'], 'intention/dom/html', function(selector, element, utils) {
	'use strict';

	return {
		/**
		 * Creates an HTML tag
		 *
		 * @method create
		 *
		 * @depends document
		 *
		 * @param {String} tag
		 * @param {Object} options
		 * @param {Array} children
		 * @param {String} appendTo
		 *
		 * @return {Element}
		 */
		create:function create(tag, options, children, appendTo) {
			options = (options || {});
			children = (children || []);

			var el = document.createElement(tag);

			for (var i in options) {
				if (options.hasOwnProperty(i)) {
					// Since we are changing keys like 'innerHTML' we want to preserve the original value
					var key = i;

					if (i === 'html') { key = 'innerHTML'; }
					else if (i === 'class') { key = 'className'; }
					else if (i === 'style' && typeof options[i] !== 'string') {
						element.css(el, options[i]);
						continue;
					}
					else if (i === 'data' && typeof options[i] === 'object') {
						for (var ii in options[i]) {
							if (options[i].hasOwnProperty(ii)) {
								el.dataset[ii] = options[i][ii];
							}
						}
					}

					el[key] = options[i];
				}
			}

			// @Todo Isn't this always true?
			if (typeof children.length !== 'undefined') {
				// Append ALL the children!
				for (var j = 0; j < children.length; j ++) {
					el.appendChild(children[j]);
				}
			}

			// Do not append
			if (typeof appendTo === 'undefined') {
				return el;
			}

			// Append to a single element
			else if (typeof appendTo.appendChild === 'function') {
				appendTo.appendChild(el);
				return el;
			}

			// Find the element to append to
			else if (typeof appendTo === 'string') {
				var target = selector.select(appendTo);
				if (!target) {
					console.error('Unknown element: (' + appendTo + ')');
				}
				else if (target.length === 1) {
					// No need for loops if there is only 1 element
					target[0].appendChild(el);
					return el;
				}

				// Loop through the array-like object
				else {
					for (var k = target.length; k --;) {
						target[k].appendChild(el.cloneNode(true));
					}
				}
			}

			return el;
		},

		/**
		 * Removes an element from the DOM Tree
		 *
		 * @method remove
		 *
		 * @param {Element} element
		 */
		remove:function remove(el) {
			var list = utils.handle(el), parent, i;
			for (i = list.length; i --;) {
				parent = list[i].parentElement;
				parent.removeChild(list[i]);
			}
		}
	};
});