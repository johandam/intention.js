_Intention.module('intention/timer', function()
{
	'use strict';

	/**
	 * [Timer description]
	 *
	 * @method Timer
	 *
	 * @depends [depends]
	 */
	function Timer()
	{
		this.timer = null;
		this.interval = null;
		this.callback = function(){};
	}

	/**
	 * [start description]
	 *
	 * @method start
	 *
	 * @depends [depends]
	 *
	 * @param {[type]} interval
	 *
	 * @return {[type]}
	 */
	Timer.prototype.start = function Timer_start(interval)
	{
		if(typeof interval !== 'undefined')
		{
			this.interval = interval;
		}

		this.timer = setInterval(this.callback, this.interval);

		return this;
	};

	/**
	 * [stop description]
	 *
	 * @method stop
	 *
	 * @depends [depends]
	 *
	 * @return {[type]}
	 */
	Timer.prototype.stop = function Timer_stop()
	{
		clearInterval(this.timer);

		return this;
	};

	/**
	 * [setInterval description]
	 *
	 * @method setInterval
	 *
	 * @depends [depends]
	 *
	 * @param {[type]} interval
	 */
	Timer.prototype.setInterval = function Timer_setInterval(interval)
	{
		this.interval = interval;

		return this;
	};

	/**
	 * [setCallback description]
	 *
	 * @method setCallback
	 *
	 * @depends [depends]
	 *
	 * @param {Function} callback
	 */
	Timer.prototype.setCallback = function Timer_setCallback(callback)
	{
		this.callback = callback;

		return this;
	};

	// Keeps track of the Timers
	var _timers = {};

	/**
	 * [timerFactory description]
	 *
	 * @method timerFactory
	 *
	 * @depends [depends]
	 *
	 * @param {[type]} key
	 *
	 * @return {[type]}
	 */
	return function timerFactory(key)
	{
		if(typeof key === 'undefined')
		{
			return new Timer();
		}

		else if(typeof _timers[key] === 'undefined')
		{
			_timers[key] = new Timer();
		}

		return _timers[key];
	};
});