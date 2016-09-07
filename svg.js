_Intention.module('intention/svg', function()
{
	function SVG(attributes)
	{
		attributes = (attributes || {});
		this.element = SVG.create('svg', attributes);
		// this.element.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
	}

	SVG.create = function SVG_create(type, attributes)
	{
		var svg = document.createElementNS('http://www.w3.org/2000/svg', type);
		for (var key in attributes) {
			if (attributes.hasOwnProperty(key)) {
				// if (svg.hasAttribute(key)) if (key.indexOf(':') > 0) {
					var keys = key.split(':');
					svg.setAttributeNS('http://www.w3.org/1999/' + keys[0], keys[1], attributes[key]);

					// svg.setAttributeNS(key, attributes[key]);
				}
				else
				{
					svg.setAttribute(key, attributes[key]);
				}
			}
		}

		return svg;
	};

	SVG.prototype.add = function SVG_add(type, attributes)
	{
		var svg = SVG.create(type, attributes);
		this.element.appendChild(svg);

		return svg;
	};

	return SVG;
});