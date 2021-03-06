_Intention.module('intention/utils', 'intention/dom/trigger', function(utils) {
	'use strict';

	/**
	 * Private method to actually fire an event
	 */
	function _fireEvent(element, type, data) {
		data = (data || {});
		data.detail = (data.detail || {});
		data.bubbles = (data.bubbles || true);
		data.cancelable = (data.cancelable || true);

		if (typeof element.dispatchEvent !== 'undefined') {
			element.dispatchEvent(new CustomEvent(type, data));

			return true;
		}

		// First try to trigger a normal event
		element.fireEvent('on' + type);

		// Stupid IE - Let's trigger the onpropertychange event since it doesn't support custom events
		element['_' + type + '_'] = data;

		return true;
	}

	/**
	 * Fires an <type> event for <element> with <data>
	 *
	 * @method trigger
	 *
	 * @depends [depends]
	 *
	 * @param {Element} element
	 * @param {String} type
	 * @param {Object} data
	 */
	function trigger(element, type, data) {
		var list = utils.handle(element);
		for (var i = list.length; i --;) {
			_fireEvent(list[i], type, data);
		}
	}

	// ===== trigger() Facades ===== //

	trigger.click = function Trigger_click(element, data){ return trigger(element, 'click', data); };
	trigger.change = function Trigger_change(element, data){ return trigger(element, 'change', data); };
	trigger.keyDown = function Trigger_keyDown(element, data){ return trigger(element, 'keyDown', data); };
	trigger.keyUp = function Trigger_keyUp(element, data){ return trigger(element, 'keyUp', data); };

	return trigger;
});