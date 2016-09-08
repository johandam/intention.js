var _Intention = (function() {
	'use strict';

	// Private variables, used by the functions defined below.
	var _body = document.getElementsByTagName('body')[0], // Let's set this up in advance
		_unprocessed = {},         // Holds a list of all the modules included
		_processed = {},           // Holds all processed modules
		_modules = [],             // Holds all the modules initial function
		_modulesTotal = 0,         // Total amount of modules to be included
		_modulesCompleted = 0,     // Total amount of modules currently included
		_anonymous = 0,            // Used to keep track of anonymous modules for load();
		_urlPattern = new RegExp(
			'^(https?:\/\/)?'+ // protocol
			'((([a-z0-9]([a-z0-9-]*[a-z0-9])*)\\.)+[a-z]{2,}|'+  // domain name
			'((0-9{1,3}\\.){3}0-9{1,3}))'+                       // OR ip (v4) address
			'(\\:0-9+)?(\/[-a-z0-9%_.~+]*)*'+                    // port and path
			'(\\?[;&a-z0-9%_.~+=-]*)?'+                          // query string
			'(\\#[-a-z0-9_]*)?$', 'i'                            // fragment locater
		), // Used to check if a dependancy is an URL and thus, should not receive prefix / suffix

		// What we will export in this function
		_export = {
			module:module,
			load:load,
			get:get,
			prefix:'/js/',
			suffix:'.js'
		};

	// When we got all the modules ready, it's time to set them all up.
	function initializeModules() {
		// Go through all the callbacks and execute it
		for (var i = _modules.length; i --;) {
			initialize(_modules[i]);
		}
	}

	// Set each module up with the proper dependancies
	function initialize(item) {
		var args = [], // Holds the dependancies so we can give it to the module when we're done.
			name = item.name, dependancies = item.dependancies, dependancy;

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

	/**
	 * Get the dependancy if we can find it
	 */
	function getDependancy(name) {
		var dependancy = _processed[name];

		if (typeof dependancy === 'undefined') {
			try {
				// If the dependancy has not been loaded yet, load it.
				var module = findModule(name);
				initialize(module);
			} catch(err) {
				// Module not found... now whut?
				// If it was meant to be a module, this is an error. Maybe the module name contains a typo or something. So we should throw an error
				// But if it's an externalal source that doesn't obay the module pattern, it makes perfect sense we can't find it. So we shouldn't throw an error
				// Let's mediate and throw an info instead.
				console.info('Unable to find requested module (' + name + '), hopefully you didn\'t meant for it to be a module');
			}

			// Even though the dependancy got loaded, we stil have an 'undefined' in the variable, let's fix that
			dependancy = _processed[name];
		}

		return dependancy;
	}

	/**
	 * Retrieve the module
	 */
	function findModule(name) {
		// This is an ugly way to find the correct dependancy, but I don't know of a better way
		for (var i = _modules.length; i --;) {
			if (_modules[i].name === name) {
				return _modules[i];
			}
		}

		throw 'Module "' + name + '" not found';
	}

	function addScript(dependancy, ignorePrefix, callback) {
		// TODO: Check the onerror event for Stupid IE so we know when the file can not be loaded in Stupid IE
		// wait... Who the fuck cares about Stupid IE?

		var s = document.createElement('script');
		s.onload = callback;

		s.onerror = function() {
			throw '404: Dependancy "' + dependancy + '" failed to load (did you check the prefix / suffix?)';
		};

		// Stupid IE - Doesn't reconize .onload()
		s.onreadystatechange = function() {
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

	/**
	 * Some stuff we load in through our own module pattern, others are just random scripts on the web
	 * We need to deal with both of them
	 */
	function getSrc(dependancy, ignorePrefix) {
		if (ignorePrefix || _urlPattern.test(dependancy)) {
			return dependancy;
		}

		// Add the prefix and suffix
		return (_export.prefix + dependancy + _export.suffix);
	}

	/**
	 * The code below probalby contains bugs. I doubt this works perfectly when multiple loads etc are called within each other.
	 */
	function resetCounters() {
		// TODO: The commented code below is in purgatory, possibly necesary possibly garbage.
		// Uncomment or remove below comments when I'm sure wether or not they should be in/excluded

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
	 * @param {Mixed} dependancies Which stuff you want to have available when your module starts
	 * @param {String} name, A module needs a name so it can become a dependancy for others
	 * @param {Function} module, will be called when all dependancies have been retrieved, the dependancies will be in the arguments
	 * @param {Boolean} ignorePrefix, make it clear the dependancies are not modules (I think?)
	 */
	function module(dependancies, name, module, ignorePrefix) {
		// Check if the first parameter is meant as the name of the module, instead of the dependancies
		if (typeof dependancies === 'string' && typeof name === 'function') {
			module = name;
			name = dependancies;
			dependancies = [];
		}

		if (_processed[name]){
			return _processed[name];
		}
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
				addScript(dependancies[i], ignorePrefix, function() {
					_modulesCompleted ++;

					if (_modulesTotal === _modulesCompleted) {
						initializeModules();
					}
				});
			}
		}
	}

	/**
	 * Load the given dependancies, works basically as a module except it can't become a dependancy of it's own.
	 *
	 * @method load
	 *
	 * @param {Array} dependancies
	 * @param {Function} callback
	 * @param {Boolean} ignorePrefix
	 */
	function load(dependancies, callback, ignorePrefix) {
		resetCounters();

		var anonName = _anonymous ++;

		return module(dependancies, anonName, callback, ignorePrefix);
	}

	/**
	 * Fetch a module
	 *
	 * @method get
	 *
	 * @param {String} name
	 *
	 * @return {Function} the module
	 */
	function get(module) {
		return _processed[module];
	}

	return _export;
})();