_Intention.module('intention/utils', 'intention/slave', function(utils) {
	'use strict';

	/**
	 * Constructor function, creates a new Slave (AKA WebWorker)
	 */
	function Slave() {
		this.worker = null;

		this.includeProto = false;
		this.fn = {};
	}

	/**
	 * Slaves need to work, give them a job
	 *
	 * @method GiveJob
	 *
	 * @param {Function} func The job to perform
	 */
	Slave.prototype.giveJob = function Slave_giveJob(func) {
		try {
			this.webWorkerPerform(func);
		} catch(e) {
			// WebWorker is not supported... Let's try a fallback then,
			this.fallbackPerform(func);
		}

		return this;
	};

	/**
	 * To do a good job, a slave needs tools
	 *
	 * @method GiveTools
	 *
	 * @param {Object} fn Object containing everything the Worker should need
	 * @param {Boolean} includeProto Whether or not to include the prototype
	 */
	Slave.prototype.giveTools = function Slave_giveTools(fn, includeProto) {
		if (this.worker !== null) {
			throw 'slave.giveTools() must be called before slave.giveJob(), not after';
		}

		this.includeProto = !!includeProto;
		this.fn = fn;

		return this;
	};

	/**
	 * Tell the slave to start working
	 * Any argument will be passed to the Slave through postMessage
	 */
	Slave.prototype.work = function Slave_work() {
		var args = Array.prototype.slice.call(arguments, 0);
		this.worker.postMessage(args);

		return this;
	};

	/**
	 * When the Slave is done with something and has something to say, call this function
	 *
	 * @param {Function} callback
	 */
	Slave.prototype.whenComplete = function whenComplete(callback) {
		this.worker.onmessage = function worker_onmessage(e) {
			callback(e.data);
		};

		return this;
	};

	/**
	 * Creates the WebWorker with the given instructions
	 *
	 * @depends WebWorker
	 *
	 * @param {Function} func The job to perform
	 */
	Slave.prototype.webWorkerPerform = function Slave_webWorkerPerform(func) {
		var b = new Blob([
			'try {' +
				'var fn = ' + utils.stringifyObj(this.fn, this.includeProto) + ';' +
				'var that = fn;' +
				'self.onmessage = function(e) {' +
					'self.postMessage(' + func + '.apply(fn, e.data))' +
				'}' +
			'} catch(e) {' +
			' throw e;' +
			'}'
		]);

		this.worker = new Worker(window.URL.createObjectURL(b));
	};

	/**
	 * If WebWorkers aren't available then we will have to fake it till we make it.
	 * Obviously this won't benefit from the advantages of webworkers
	 * but it will get the job you give it done.
	 *
	 * @param {Function} func The job to perform
	 */
	Slave.prototype.fallbackPerform = function Slave_fallbackPerform(func) {
		this.worker = {
			postMessage:function(args) {
				// We're expected to be async, this is the closest thing we can get to that without WebWorkers
				var that = this;
				setTimeout(function() {
					var data = func.apply(this.fn, args);

					that.onmessage({
						data:data
					});
				}, 1);
			},
			onmessage:function() { /* ===== placeholder ===== */ }
		};
	};

	return Slave;
});