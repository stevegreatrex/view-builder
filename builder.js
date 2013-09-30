/*global require:false, module:true*/

(function (require, module) {
	"use strict";

	var nano = require("nano");
	module.exports = processDesignDocuments
	
	//are we calling directly?  if so, run immediately
	if (process.argv.length === 4) {
		processDesignDocuments(process.argv[2], process.argv[3]);
	}

	function processDesignDocuments(dbUrl, designDocuments, done) {
		var db = nano(dbUrl),
			docs = [];
		done = done || function () { };

		if (typeof (designDocuments) === "string") {
			console.log("Loading " + designDocuments);
			designDocuments = require(designDocuments);
		}

		for (var prop in designDocuments) {
			if (designDocuments.hasOwnProperty(prop)) {
				docs.push({ name: prop, design: designDocuments[prop] });
			}
		}

		console.log("Found " + docs.length + " design documents");

		if (docs.length) {
			var doc = docs.pop();
			updateDesignDocument(db, doc.name, doc.design, processNextDoc);
		}

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

	function updateDesignDocument(db, name, design, done) {
		var designDocUrl = "_design/" + name;

		console.log("Processing " + name);

		db.get(designDocUrl, function (err, body) {
			if (err && !isMissingDoc(err)) {
				console.log(err);
				done(err);
				return;
			}

			body = body || {};

			if (!isUpdated(body, design)) {
				console.log("No changes; skipping " + name);
				done();
				return;
			}

			for (var prop in design) {
				if (design.hasOwnProperty(prop)) {
					body[prop] = design[prop];
				}
			}

			console.log("Updating " + name);
			db.insert(body, designDocUrl, handleInsert(name, done));
		});
	}

	function handleInsert(name, done) {
		return function (err, body) {
			if (!err) {
				console.log(name + " updated successfully");
			} else {
				console.log(err);
			}
			done(err, body);
		}
	}

	function isUpdated(current, update) {
		for (var prop in update) {
			if (!update.hasOwnProperty(prop)) { continue; }
			if (!(prop in current)) { return true; }

			if (getContent(current[prop]) !== getContent(update[prop])) {
				return true;
			}
		}

		return false;
	}

	function isMissingDoc(err) {
		return err.status_code === 404;
	}

	function foreachPropery(obj, callback) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(obj)) {
				callback(prop, obj[prop]);
			}
		}
	}

	function getContent(doc) {
		return JSON.stringify(doc, function (key, value) {
			if (typeof (value) === "function") {
				return value.toString();
			}
			return value;
		});
	}
	
}(require, module));