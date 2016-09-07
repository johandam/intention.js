_Intention.module('intention/utils', 'intention/slave', function(utils)
{
	'use strict';

	function Slave()
	{
		this.worker = null;

		this.includeProto = false;
		this.fn = {};
	}

	Slave.prototype.giveJob = function Slave_giveJob(func)
	{
		try {
			this.webWorkerPerform(func);
		} catch(e) {
			// WebWorker is not supported... Let's try a fallback then,
			this.fallbackPerform(func);
		}

		return this;
	};

	Slave.prototype.giveTools = function Slave_giveTools(fn, includeProto)
	{
		if (this.worker !== null) {
			throw 'slave.giveTools() must be called before slave.giveJob(), not after';
		}

		this.includeProto = !!includeProto;
		this.fn = fn;

		return this;
	};

	Slave.prototype.work = function Slave_work()
	{
		var args = Array.prototype.slice.call(arguments, 0);
		this.worker.postMessage(args);

		return this;
	};

	Slave.prototype.whenComplete = function whenComplete(callback)
	{
		this.worker.onmessage = function worker_onmessage(e)
		{
			callback(e.data);
		};

		return this;
	};

	Slave.prototype.webWorkerPerform = function Slave_webWorkerPerform(func)
	{
		var blob = new Blob([
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

		this.worker = new Worker(window.URL.createObjectURL(blob));
	};

	Slave.prototype.fallbackPerform = function Slave_fallbackPerform(func)
	{
		this.worker = {
			postMessage:function(args)
			{
				// We're expected to be async, this is the closest thing we can get to that without WebWorkers
				var that = this;
				setTimeout(function() {
					var data = func.apply(this.fn, args);

					that.onmessage({
						data:data
					});
				}, 1);
			},
			onmessage:function(){ /* ===== placeholder ===== */ }
		};
	};

	return Slave;
});