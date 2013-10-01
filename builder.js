/*global require:false, module:true*/

(function (require, module) {
	"use strict";

	var nano = require("nano");
	module.exports = processDesignDocuments

	/**
	* Processes the design documents specified against the
	* couch database identified by dbUrl
	*
	* @param dbUrl				A URL representing the database into which design documents should be passed
	* @param designDocuments	Either an object representing the design documents, or the string module name
	*							containing the design document definitions. 
	* @param done				The callback to be invoked on complection
	*/
	function processDesignDocuments(dbUrl, designDocuments, done) {
		done = done || function () { };
		designDocuments = designDocuments || (process.cwd() + "/views.js");

		try {
			var db = nano(dbUrl);
		} catch (err) {
			console.log("Error connecting to database: " + dbUrl);
			done(err);
		}

		var docs = createDocumentQueue(designDocuments);

		console.log("Found " + docs.length + " design documents");

		if (docs.length) {
			var doc = docs.pop();
			updateDesignDocument(db, doc.name, doc.design, processNextDoc);
		} else {
			done();
		}

		/**
		* Pops a design document off the queue, or completes processing if all have been completed.
		*/
		function processNextDoc(err) {
			if (err) {
				done(err);
				return;
			}

			if (docs.length) {
				var doc = docs.pop();
				updateDesignDocument(db, doc.name, doc.design, processNextDoc);
			} else {
				console.log("All design documents processed");
				done();
			}
		}
	};

	/**
	* Processes a single design document from the queue.
	*
	* @param db The nano instance to be used for updates
	* @param name The name of the design document
	* @param design The design document content
	* @param done The callback to be invoked on complection
	*/
	function updateDesignDocument(db, name, design, done) {
		var designDocUrl = "_design/" + name;

		db.get(designDocUrl, function (err, body) {

			//quit on error unless it's a 404 - then we want to create the doc
			if (err && !isMissingDoc(err)) {
				console.log(err);
				done(err);
				return;
			}

			//make sure we have *some* document content
			body = body || {};


			if (!containsChanges(body, design)) {
				console.log(name + ": no changes; skipping " + name);
				done();
				return;
			}

			for (var prop in design) {
				if (design.hasOwnProperty(prop)) {
					body[prop] = design[prop];
				}
			}

			console.log(name + ": changes found; updating...");
			db.insert(body, designDocUrl, onInsertComplete(name, done));
		});
	}

	/**
	* Generates a function to handle the completion of an insert.
	*
	* @param name The name of the inserted design document
	* @param done The callback to be invoked on complection
	*/
	function onInsertComplete(name, done) {
		return function (err, body) {
			if (err) {
				console.log(err);
			}
			done(err, body);
		}
	}

	/**
	* Check whether or not the updated design document has changed since
	* current.
	*
	* @param current The current design document
	* @param The updated design document
	* @returns true if update contains changes relative to current
	*/
	function containsChanges(current, update) {
		for (var prop in update) {
			if (!update.hasOwnProperty(prop)) { continue; }
			if (!(prop in current)) { return true; }

			if (getContentWithFunctions(current[prop]) !== getContentWithFunctions(update[prop])) {
				return true;
			}
		}

		return false;
	}

	/**
	* Check whether or not the specified error represents a missing design
	* document
	*
	* @param err The error object
	* @returns true if the error represents a missing design document
	*/
	function isMissingDoc(err) {
		return err.status_code === 404;
	}

	/**
	* Serializes the doc parameter, replacing functions with their content as a string.
	*
	* @param doc The document to be serialized
	* @returns {String} The serialized content.
	*/
	function getContentWithFunctions(doc) {
		return JSON.stringify(doc, function (key, value) {
			if (typeof (value) === "function") {
				return value.toString();
			}
			return value;
		});
	}

	/**
	* Loads the design document and builds a queue of named documents to be processed
	*
	* @param designDocuments	Either an object representing the design documents, or the string module name
	*							containing the design document definitions. 
	* @returns {Array} A queue of documents to be processed.
	*/
	function createDocumentQueue(designDocuments) {
		if (typeof (designDocuments) === "string") {
			console.log("Loading " + designDocuments);
			try {
				designDocuments = require(designDocuments);
			} catch (err) {
				console.log("Error loading design document definitions file: " + designDocuments);
				throw err;
			}
		}

		var docs = [];
		for (var prop in designDocuments) {
			if (designDocuments.hasOwnProperty(prop)) {
				docs.push({ name: prop, design: designDocuments[prop] });
			}
		}

		return docs;
	}
	
}(require, module));