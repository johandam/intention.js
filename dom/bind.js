_Intention.module('intention/utils', 'intention/dom/bind', function(utils)
{
	'use strict';
	var _standardEvents = [
		//<body> and <frameset> Events
		'load',
		'unload',
		//Form Events
		'blur',
		'change',
		'focus',
		'reset',
		'select',
		'submit',
		//Image Events
		'abort',
		//Keyboard Events
		'keydown',
		'keypress',
		'keyup',
		//Mouse Events
		'click',
		'dblclick',
		'mousedown',
		'mousemove',
		'mouseout',
		'mouseover',
		'mouseup',

		'drop'
	];

	function _attach(element, type, callback)
	{
		// Workaround for custom events for Stupid IE
		if (!utils.inArray(type, _standardEvents) && typeof CustomEvent === 'undefined') {
			type = 'propertychange';
			element['_' + type + '_'] = null;

			var _callback = callback;
			callback = function()
			{
				if (typeof element['_' + type + '_'] !== 'undefined') {
					_callback(element['_' + type + '_']);
				}

				return true;
			};
		}

		if (typeof element.addEventListener !== 'undefined') {
			element.addEventListener(type, callback, false);
		}

		// Stupid IE. Code to deal with stupid IE is inspired by:
		// http://dean.edwards.name/weblog/2009/03/callbacks-vs-events/
		else if (typeof element.attachEvent !== 'undefined') {
			element.attachEvent('on' + type, function(event) { callback.call(element, event); });
		} else {
			throw 'Binding on non-element: "' + element + '"';
		}
	}

	/**
	 * [bind description]
	 *
	 * @method bind
	 *
	 * @depends [depends]
	 *
	 * @param {[type]} element
	 * @param {[type]} type
	 * @param {Function} callback
	 *
	 * @return {[type]}
	 */
	function bind(element, type, callback)
	{
		var list = utils.handle(element);
		for (var i = list.length; i --;) {
			_attach(list[i], type, callback);
		}
	}

	/**
	 * [movable description]
	 *
	 * @method movable
	 *
	 * @param HTMLObject element
	 *
	 * @return Something
	 */
	bind.movable = function bind_movable(element, target)
	{
		var start = {},
			moving = false;

		target = (target || element);

		// Start moving this thing
		bind.mouseDown(element, function(e)
		{
			start = utils.getMouseCoords(e, element);
			moving = true;
		});

		// Move this thing
		bind.mouseMove('body', function(e)
		{
			if (moving) {
				var coords = utils.getMouseCoords(e, this);
				target.style.left = (coords.x - start.x) + 'px';
				target.style.top = (coords.y - start.y) + 'px';
			}

		});

		// Stop moving this thing
		bind.mouseUp('body', function()
		{
			moving = false;
		});
	};

	// ===== bind() Facades ===== //

	/**
	 * [click description]
	 *
	 * @method click
	 *
	 * @depends [depends]
	 *
	 * @param {[type]} element
	 * @param {Function} callback
	 *
	 * @return {[type]}
	 */
	bind.click = function bind_click(element, callback)
	{
		return bind(element, 'click', callback);
	};

	/**
	 * [change description]
	 *
	 * @method change
	 *
	 * @depends [depends]
	 *
	 * @param {[type]} element
	 * @param {Function} callback
	 *
	 * @return {[type]}
	 */
	bind.change = function bind_change(element, callback)
	{
		return bind(element, 'change', callback);
	};

	/**
	 * [keyPress description]
	 *
	 * @method keyPress
	 *
	 * @depends [depends]
	 *
	 * @param {[type]} element
	 * @param {Function} callback
	 *
	 * @return {[type]}
	 */
	bind.keyPress = function bind_keyPress(element, callback)
	{
		return bind(element, 'keypress', callback);
	};
	bind.keypress = bind.keyPress;

	/**
	 * [keyDown description]
	 *
	 * @method keyDown
	 *
	 * @depends [depends]
	 *
	 * @param {[type]} element
	 * @param {Function} callback
	 *
	 * @return {[type]}
	 */
	bind.keyDown = function bind_keyDown(element, callback)
	{
		return bind(element, 'keydown', callback);
	};
	bind.keydown = bind.keyDown;

	/**
	 * [keyUp description]
	 *
	 * @method keyUp
	 *
	 * @depends [depends]
	 *
	 * @param {[type]} element
	 * @param {Function} callback
	 *
	 * @return {[type]}
	 */
	bind.keyUp = function bind_keyUp(element, callback)
	{
		return bind(element, 'keyup', callback);
	};
	bind.keyup = bind.keyUp;

	/**
	 bind [bind_mouseClick description]
	 *
	 * @method mouseDown
	 *
	 * @depends [depends]
	 *
	 * @param {[type]} element
	 * @param {Function} callback
	 */
	bind.mouseDown = function bind_mouseDown(element, callback)
	{
		return bind(element, 'mousedown', callback);
	};
	bind.mousedown = bind.mouseDown;

	/**
	 bind [bind_mouseClick description]
	 *
	 * @method mouseUp
	 *
	 * @depends [depends]
	 *
	 * @param {[type]} element
	 * @param {Function} callback
	 */
	bind.mouseUp = function bind_mouseUp(element, callback)
	{
		return bind(element, 'mouseup', callback);
	};
	bind.mouseup = bind.mouseUp;

	/**
	 * [mouseMove description]
	 *
	 * @method mouseMove
	 *
	 * @depends [depends]
	 *
	 * @param {[type]} element
	 * @param {Function} callback
	 *
	 * @return {[type]}
	 */
	bind.mouseMove = function bind_mouseMove(element, callback)
	{
		return bind(element, 'mousemove', callback);
	};
	bind.mousemove = bind.mouseMove;

	/**
	 * [mouseOut description]
	 *
	 * @method mouseOut
	 *
	 * @depends [depends]
	 *
	 * @param {[type]} element
	 * @param {Function} callback
	 *
	 * @return {[type]}
	 */
	bind.mouseOut = function bind_mouseOut(element, callback)
	{
		return bind(element, 'mouseout', callback);
	};
	bind.mouseout = bind.mouseOut;

	/**
	 * [focus description]
	 *
	 * @method focus
	 *
	 * @depends [depends]
	 *
	 * @param {[type]} element
	 * @param {Function} callback
	 *
	 * @return {[type]}
	 */
	bind.focus = function bind_focus(element, callback)
	{
		return bind(element, 'focus', callback);
	};

	/**
	 * [blur description]
	 *
	 * @method blur
	 *
	 * @depends [depends]
	 *
	 * @param {[type]} element
	 * @param {Function} callback
	 *
	 * @return {[type]}
	 */
	bind.blur = function bind_blur(element, callback)
	{
		return bind(element, 'blur', callback);
	};

	/**
	 * [submit description]
	 *
	 * @method  submit
	 *
	 * @depends [depends]
	 *
	 * @param  {[type]}   element
	 * @param  {Function} callback
	 *
	 * @return {[type]}
	 */
	bind.submit = function bind_submit(element, callback)
	{
		return bind(element, 'submit', callback);
	};

	return bind;
});