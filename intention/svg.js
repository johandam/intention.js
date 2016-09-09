_Intention.module('intention/svg', function() {
	'use strict';

	function SVG(attributes) {
		attributes = (attributes || {});
		this.element = SVG.create('svg', attributes);
		// this.element.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
	}

	/**
	 * Create a new SVG element, basically a factory
	 *
	 * @method Create
	 *
	 * @param {String} type The type of element to make
	 * @param {Object} attributes Which attributes the object should have
	 *
	 * @return SVGElement
	 */
	SVG.create = function SVG_create(type, attributes) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', type);
		for (var key in attributes) {
			if (attributes.hasOwnProperty(key)) {
				// if (svg.hasAttribute(key)) if (key.indexOf(':') > 0) {
					var keys = key.split(':');
					svg.setAttributeNS('http://www.w3.org/1999/' + keys[0], keys[1], attributes[key]);

					// svg.setAttributeNS(key, attributes[key]);
				} else {
					svg.setAttribute(key, attributes[key]);
				}
			}
		}

		return svg;
	};

	/**
	 * Add new SVG element to current element
	 *
	 * @method Add
	 *
	 * @param {String} type The type of element to make
	 * @param {Object} attributes Which attributes the object should have
	 *
	 * @return SVGElement
	 */
	SVG.prototype.add = function SVG_add(type, attributes) {
		var svg = SVG.create(type, attributes);
		this.element.appendChild(svg);

		return svg;
	};

	return SVG;
});