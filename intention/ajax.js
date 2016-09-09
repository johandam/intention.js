_Intention.module('intention/ajax', function() {
	'use strict';

	/**
	 * Performs an ajax request to the requested url with specified data
	 *
	 * @method ajax
	 *
	 * @depends XMLHttpRequest
	 *
	 * @param {String} type The type of request to send, for example 'post' or 'get'
	 * @param {String} url The endpoint of the request
	 * @param {Mixed} data Optional, data to send to the endpoint
	 * @param {Function} onsuccess Optional, success callback handler * @param {Function} onfailure Optional, failure callback handler *
	 * @return {Object} the XHR Object
	 */
	function ajax(type, url, data, onsuccess, onfailure) {
		var xhr = new XMLHttpRequest();

		if (typeof data === 'function') {
			if (typeof onsuccess === 'function') {
				onfailure = onsuccess;
			}

			onsuccess = data;
		}

		xhr.onreadystatechange = function xhr_onreadystatechange() {
			// Only fire the onsuccess callback if everything went alright and the callback is a function
			if (xhr.readyState === 4 && xhr.status === 200) {
				if (typeof onsuccess === 'function') {
					onsuccess(xhr.responseText);
				}
			}

			// Only fire the onfaiure callback if the request has been completed but wasn't succesfull
			else if (xhr.readyState === 4) {
				if (typeof onfailure === 'function') {
					onfailure();
				} else {
					throw 'Ajax request failed with status: "' + xhr.status + '"';
				}
			}
		};

		xhr.open(type, url, true);

		// Add an extra header if this is a post request
		if (type.toLowerCase() === 'post') {
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		}

		// If data is an object (but not NULL), let's turn it into a valid parameter string
		if (typeof data === 'object' && data) {
			var tmp = '', dl = '';
			for (var key in data) {
				if (data.hasOwnProperty(key)) {
					tmp += (dl + key + '=' + encodeURIComponent(data[key]));
					dl = '&';
				}
			}

			data = tmp;
		}

		xhr.send(data);

		return xhr;
	}

	// ===== ajax() Facades ===== //

	ajax.post = function Intention_ajax_post(url, data, onsuccess, onfailure) {
		return ajax('post', url, data, onsuccess, onfailure);
	};

	ajax.get = function Intention_ajax_get(url, data, onsuccess, onfailure) {
		return ajax('get', url, data, onsuccess, onfailure);
	};

	return ajax;
});