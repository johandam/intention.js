_Intention.module('intention/timer', function() {
	'use strict';

	// Keeps track of the Timers
	var _timers = {};

	/**
	 * Constructor function, basically it's an OOP way of dealing with setIntervals
	 *
	 * @method Timer
	 *
	 * @param {Function} callback, Optional. Can be given at other places, to be called when the timer is done
	 * @param {Number} interval of the timer, Optional. Can be given at other places
	 */
	function Timer(callback, interval) {
		this.timer = null;
		this.callback = (callback || function() {});
		this.interval = (interval || 0);
	}

	/**
	 * Start the timer
	 *
	 * @method start
	 *
	 * @param {Function} callback, Optional. Can be given at other places, to be called when the timer is done
	 * @param {Number} interval of the timer, Optional. Can be given at other places
	 */
	Timer.prototype.start = function Timer_start(callback, interval) {
		if (typeof callback !== 'undefined') {
			this.callback = callback;
		}
		if (typeof interval !== 'undefined') {
			this.interval = interval;
		}

		this.timer = setInterval(this.callback, this.interval);

		return this;
	};

	/**
	 * Stop the timer
	 *
	 * @method stop
	 */
	Timer.prototype.stop = function Timer_stop() {
		clearInterval(this.timer);

		return this;
	};

	/**
	 * Set the interval to use.
	 *
	 * @method setInterval
	 *
	 * @param {Number} interval of the timer, Optional. Can be given at other places
	 */
	Timer.prototype.setInterval = function Timer_setInterval(interval) {
		this.interval = interval;

		return this;
	};

	/**
	 * Set the callback to use when the timer runs out
	 *
	 * @method setCallback
	 *
	 * @param {Function} callback, Optional. Can be given at other places, to be called when the timer is done
	 */
	Timer.prototype.setCallback = function Timer_setCallback(callback) {
		this.callback = callback;

		return this;
	};

	/**
	 * timerFactory Sets up a timer with given key as identifier or retrieves it if the timer already exists with such a key
	 *
	 * @method timerFactory
	 *
	 * @param {String} key
	 *
	 * @return {Timer}
	 */
	return function timerFactory(key) {
		if (typeof key === 'undefined') {
			return new Timer();
		}

		else if (typeof _timers[key] === 'undefined') {
			_timers[key] = new Timer();
		}

		return _timers[key];
	};
});