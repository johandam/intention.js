_Intention.module('intention/indexeddb', function() {
	'use strict';

	// Shortcuts to possibly prefixed objects. There are checks for unused prefixes, which were added anyway for completion sake
	var indexedDB = (window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB || window.oIndexedDB),
		IDBKeyRange = (window.IDBKeyRange || window.webkitIDBKeyRange || window.mozIDBKeyRange || window.msIDBKeyRange || window.oIDBKeyRange),
		_private = {
			onerror:function(error) {
				throw error;
			},

			setReady:function(that) {
				that.ready = true;

				this.callCue(that);
			},

			callCue:function(that) {
				var job, i;
				for(i = 0; i < that.cue.length; i ++)
				{
					job = that.cue[i];

					that[job.func].apply(that, job.args);
				}

				return that;
			},

			sanitycheck:function(that, func, args) {
				// If the database is not ready, put the request in the cue so it can be executed later
				if (!that.ready) {
					that.cue[that.cue.length] = {func:func, args:args};
					return false;
				}

				return true;
			}
		};

	/**
	 * Constructor function
	 *
	 * @method IndexedDB
	 *
	 * @depends IndexedDB (we actually need the native implementation before we can put our shell around it)
	 *
	 * @param {String} name, the name of the database
	 * @param {Mixed} version, so the browser knows whether or not this thing is up to date
	 * @param {Mixed} indices, so we can find stuff later on
	 */
	function IndexedDB(name, version, indices) {
		if (!indexedDB || !IDBKeyRange) {
			// Well... this is embarrassing
			throw 'IndexedDB not supported';
		}

		this.db = null;
		this.cue = [];

		this.name = name;
		this.ready = false;

		// In case people want to define their own cursors;
		this.IDBKeyRange = IDBKeyRange;

		var that = this, request = indexedDB.open(name, version);

		request.onupgradeneeded = function indexedDB_Request_onupgradeneeded(e) {
			var db = e.target.result;

			if (db.objectStoreNames.contains(this.name)) {
				// Well, that was easy
				_private.setReady(that);
			} else {
				// You know what? You set up the store
				if (typeof indices === 'function') {
					indices(db);
				}

				// Fine, I'll make the store
				else {
					db.createObjectStore(name, indices);
				}
			}

			that.db = db;
		};

		request.onsuccess = function indexedDB_Request_onsuccess(e) {
			that.db = e.target.result;
			_private.setReady(that);
		};

		request.onerror = _private.onerror;

		return this;
	}

	/**
	 * Add an object to the database,
	 *
	 * @method Add
	 *
	 * @param {Object} obj, The object to save
	 * @param {Function} callback, Called when the job is done
	 */
	IndexedDB.prototype.add = function IndexedDB_add(obj, callback) {
		if (_private.sanitycheck(this, 'add', arguments)) {
			var trans = this.db.transaction(this.name, 'readwrite'),
				store = trans.objectStore(this.name),
				request = store.put(obj);

			request.onsuccess = callback;
			request.onerror = _private.onerror;
		}

		return this;
	};

	/**
	 * Fetch an object from the database,
	 *
	 * @method Get
	 *
	 * @param {Mixed} id, The way we can recognize what we want
	 * @param {Function} callback, Called when the job is done
	 */
	IndexedDB.prototype.get = function IndexedDB_get(id, callback) {
		if (_private.sanitycheck(this, 'get', arguments)) {
			var request = this.db.transaction([this.name], 'readwrite').objectStore(this.name).get(id);
			request.onsuccess = function(e) {
				callback(e);
			};

			request.onerror = _private.onerror;
		}

		return this;
	};

	/**
	 * Fetch all the objects from the database,
	 *
	 * @method GetAll
	 *
	 * @param {Function} callback, Called when the job is done
	 */
	IndexedDB.prototype.getAll = function IndexedDB_getAll(callback) {
		if (_private.sanitycheck(this, 'getAll', arguments)) {
			this.findFrom(0, callback);
		}

		return this;
	};

	/**
	 * Count the objects in the database,
	 *
	 * @method Count
	 *
	 * @param {Mixed} index, The way we can recognize what we want
	 * @param {Function} callback, Called when the job is done
	 */
	IndexedDB.prototype.count = function IndexedDB_count(index, callback) {
		if (_private.sanitycheck(this, 'count', arguments)) {
			var store = this.db.transaction([this.name], 'readwrite').objectStore(this.name),
				request = store.index('datetime');//.count(); // <--- WAIT, that ain't supposed to be like this, is it?
			request.onsuccess = function(e) {
				callback(e);
			};

			request.onerror = _private.onerror;
		}

		return this;
	};

	/**
	 * Find objects in the database,
	 *
	 * @method FindOnly
	 *
	 * @param {Mixed} key, The way we can recognize what we want
	 * @param {Function} callback, Called when the job is done
	 */
	IndexedDB.prototype.findOnly = function IndexedDB_findOnly(key, callback) {
		var keyRange = IDBKeyRange.only(key);

		return this.find(keyRange, callback);
	};

	/**
	 * Count the objects in the database,
	 *
	 * @method FindFrom
	 *
	 * @param {Mixed} From, from where we want what we want
	 * @param {Mixed} Exclude, don't count these
	 * @param {Function} callback, called when the job is done
	 */
	IndexedDB.prototype.findFrom = function IndexedDB_findFrom(from, exclude, callback) {
		// Excludes are optional
		if (typeof exclude === 'function') {callback = exclude;
			exclude = false;
		}

		var keyRange = IDBKeyRange.lowerBound(from, exclude);

		return this.find(keyRange, callback);
	};

	/**
	 * Count the objects in the database,
	 *
	 * @method FindTill
	 *
	 * @param {Mixed} Till, till where we want what we want
	 * @param {Mixed} Exclude, don't count these
	 * @param {Function} callback, called when the job is done
	 */
	IndexedDB.prototype.findTill = function IndexedDB_findTill(till, exclude, callback) {
		// Excludes are optional
		if (typeof exclude === 'function') {callback = exclude;
			exclude = false;
		}

		var keyRange = IDBKeyRange.upperBound(till, exclude);

		return this.find(keyRange, callback);
	};

	/**
	 * Count the objects in the database,
	 *
	 * @method FindFrom
	 *
	 * @param {Mixed} From, from where we want what we want
	 * @param {Mixed} Till, till where we want what we want
	 * @param {Mixed} Exclude1, don't count these
	 * @param {Mixed} Exclude2, don't count these
	 * @param {Function} callback, called when the job is done
	 */
	IndexedDB.prototype.findBetween = function IndexedDB_findBetween(from, till, exclude1, exclude2, callback) {
		// Excludes are optional
		if (typeof exclude1 === 'function') {callback = exclude1;
			exclude1 = false;
			exclude2 = false;
		}

		var keyRange = IDBKeyRange.bound(from, till, exclude1, exclude2);

		return this.find(keyRange, callback);
	};

	/**
	 * Fetch an object from the database,
	 *
	 * @method Find
	 *
	 * @param {Cursor} KeyRange, The way we can recognize what we want
	 * @param {Function} callback, Called when the job is done
	 */
	IndexedDB.prototype.find = function IndexedDB_find(keyRange, callback) {
		if (_private.sanitycheck(this, 'find', arguments)) {
			var trans = this.db.transaction(this.name, 'readwrite'),
				store = trans.objectStore(this.name),
				cursorRequest = store.openCursor(keyRange);

			cursorRequest.onsuccess = function cursorRequest_onsuccess(e) {
				var result = e.target.result;
				if (result) {
					callback(result.value);

					// Weird calling to shut up jsHint about continue being a reserved keyword;
					result['continue']();
				}
			};

			cursorRequest.onerror = _private.onerror;
		}

		return this;
	};

	/**
	 * Remove an object from the database,
	 *
	 * @method Remove
	 *
	 * @param {Mixed} id, The way we can recognize what we want
	 * @param {Function} callback, Called when the job is done
	 */
	IndexedDB.prototype.remove = function IndexedDB_remove(id, callback) {
		if (_private.sanitycheck(this, 'remove', arguments)) {
			var trans = this.db.transaction([this.name], 'readwrite'),
				store = trans.objectStore(this.name);

			// Weird calling to shut up jsHint about delete being a reserved keyword;
			var request = store['delete'](id);

			request.onsuccess = callback;
			request.onerror = _private.onerror;
		}

		return this;
	};

	/**
	 * Remove the entire database
	 *
	 * @method DeleteDB
	 *
	 * @param {Function} callback, Called when the job is done
	 */
	IndexedDB.prototype.deleteDB = function IndexedDB_deleteDB(callback) {
		if (_private.sanitycheck(this, 'deleteDB', arguments)) {
			var request = indexedDB.deleteDatabase(this.name);

			request.onsuccess = callback;
			request.onerror = _private.onerror;
		}

		return this;
	};

	return IndexedDB;
});