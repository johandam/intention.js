var _Intention = (function()
{
	'use strict';

	// Private variables, used by the functions defined below.
	var _body = document.getElementsByTagName('body')[0], // Let's set this up in advance
		_unprocessed = {},         // Holds a list of all the modules included
		_processed = {},           // Holds all processed modules
		_modules = [],             // Holds all the modules initial function
		_modulesTotal = 0,         // Total amount of modules to be included
		_modulesCompleted = 0,     // Total amount of modules currently included
		_anonymous = 0,            // Used to keep track of anonymous modules for I.load();
		_urlPattern = new RegExp(
			'^(https?:\/\/)?'+ // protocol
			'((([a-z0-9]([a-z0-9-]*[a-z0-9])*)\\.)+[a-z]{2,}|'+  // domain name
			'((0-9{1,3}\\.){3}0-9{1,3}))'+                       // OR ip (v4) address
			'(\\:0-9+)?(\/[-a-z0-9%_.~+]*)*'+                    // port and path
			'(\\?[;&a-z0-9%_.~+=-]*)?'+                          // query string
			'(\\#[-a-z0-9_]*)?$', 'i'                            // fragment locater
		); // Used to check if a dependancy is an URL and thus, should not receive prefix / suffix

	// What we will export in this function
	var _export = {
		module:module,
		load:load,
		get:get,
		prefix:'/js/',
		suffix:'.js'
	};

	function initializeModules()
	{
		// Go through all the callbacks and execute it
		for (var i = _modules.length; i --;) {
			initialize(_modules[i]);
		}
	}

	function initialize(item)
	{
		var args = [], // Holds the dependancies so we can give it to the module when we're done.
			name = item.name, // Shortcut
			dependancies = item.dependancies, // Shortcut
			dependancy;

		for (var i = 0; i < dependancies.length; i ++) {
			dependancy = getDependancy(dependancies[i]);

			args.push(dependancy);
		}

		// It's possible that the module has already been loaded through dependancies
		// Even though it wasn't when this function got originally called
		if (typeof _processed[name] === 'undefined' && typeof _unprocessed[name] === 'function') {
			// Make sure the callback receives all the modules it loaded as arguments
			_processed[name] = _unprocessed[name].apply({}, args);
		}
	}

	function getDependancy(name)
	{
		var dependancy = _processed[name];

		if (typeof dependancy === 'undefined') {
			try {
				// If the dependancy has not been loaded yet, load it.
				var module = findModule(name);
				initialize(module);
			} catch(err) {
				console.info('Unable to find requested module (' + name + '), hopefully you didn\'t meant for it to be a module');
				// Module not found... now whut?
				// It could make sense with the ignorePrefix flag to load something from an external website.
				// It could also be a typo or other user-error, who knows?
			}

			// Even though the dependancy got loaded, we stil have an 'undefined' in the variable, let's fix that
			dependancy = _processed[name];
		}

		return dependancy;
	}

	function findModule(name)
	{
		// This is an ugly way to find the correct dependancy, but I don't know of a better way
		for (var i = _modules.length; i --;) {
			if (_modules[i].name === name) {
				return _modules[i];
			}
		}

		throw 'Module "' + name + '" not found';
	}

	function addScript(dependancy, ignorePrefix, callback)
	{
		// TODO: Check the onerror event for IE so we know when the file can not be loaded in IE
		// ... Who the fuck cares about IE?

		var s = document.createElement('script');
		s.onload = callback;

		s.onerror = function()
		{
			throw '404: Dependancy "' + dependancy + '" failed to load (did you check the prefix / suffix?)';
		};

		// Stupid IE - Doesn't reconize .onload()
		s.onreadystatechange = function()
		{
			if (this.readyState === 'loaded' && !this.nextSibling) {
				this.onerror();
			}

			else if (this.readyState === 'complete' || this.readyState === 'loaded') {
				this.onload();
			}
		};

		s.src = getSrc(dependancy, ignorePrefix);

		s.async = true;

		_body.appendChild(s);
	}

	function getSrc(dependancy, ignorePrefix)
	{
		if (ignorePrefix || _urlPattern.test(dependancy)) {
			return dependancy;
		}

		// Add the prefix and suffix
		return (_export.prefix + dependancy + _export.suffix);
	}

	function resetCounters()
	{
		// TODO: Uncomment or remove below comments when I'm sure wether or not they should be in/excluded

		// _unprocessed = {}; // Holds a list of all the modules included
		// _processed = {}; // Holds all processed modules
		_modules = []; // Holds all the modules initial function
		_modulesTotal = 0; // Total amount of modules to be included
		_modulesCompleted = 0; // Total amount of modules currently included
	}

	/**
	 * Creates a new module to be included as dependancy later by others
	 *
	 * @method module
	 *
	 * @depends [depends]
	 *
	 * @param {[type]} dependancies
	 * @param {[type]} name
	 * @param {[type]} module
	 * @param {[type]} ignorePrefix
	 *
	 * @return {[type]}
	 */
	function module(dependancies, name, module, ignorePrefix)
	{
		// Check if the first parameter is meant as the name of the module, instead of the dependancies
		if (typeof dependancies === 'string' && typeof name === 'function') {
			module = name;
			name = dependancies;
			dependancies = [];
		}

		if (_processed[name]){ return _processed[name]; }
		_unprocessed[name] = module;

		// Dammit Jim, I'm an array, not a string!
		if (typeof dependancies === 'string') {
			dependancies = [dependancies];
		}

		// Store these so we can play connect the dots later
		_modules.push({
			name:name,
			dependancies:dependancies
		});

		for (var i = 0; i < dependancies.length; i ++) {
			// No need to do logic if it's already here
			if (typeof _unprocessed[dependancies[i]] === 'undefined') {
				// Temporarily set the module to a value to prevent it from being loaded multiple times
				// This could happen since modules are loaded asynchronously.
				// So multiple scripts that have the same module as dependancy could fire before_ module[name] is set.
				// Since all modules are executed when everything is already loaded, no trace of it will remain afterwards.
				_unprocessed[dependancies[i]] = 'processing...';

				// Keep track of the modules amount
				_modulesTotal ++;

				// Add it!
				addScript(dependancies[i], ignorePrefix, function()
				{
					_modulesCompleted ++;

					if (_modulesTotal === _modulesCompleted) {
						initializeModules();
					}
				});
			}
		}
	}

	/**
	 * [load description]
	 *
	 * @method load
	 *
	 * @depends [depends]
	 *
	 * @param {[type]} dependancies
	 * @param {Function} callback
	 * @param {[type]} ignorePrefix
	 *
	 * @return {[type]}
	 */
	function load(dependancies, callback, ignorePrefix)
	{
		resetCounters();

		var anonName = _anonymous ++;

		return module(dependancies, anonName, callback, ignorePrefix);
	}

	/**
	 * [get description]
	 *
	 * @method get
	 *
	 * @depends [depends]
	 *
	 * @param {[type]} name
	 *
	 * @return {[type]}
	 */
	function get(module)
	{
		return _processed[module];
	}

	return _export;
})();