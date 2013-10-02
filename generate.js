/*global require:false, module:true*/

(function (require, module) {
	"use strict";

	var nano = require("nano"),
		fs = require("fs");

	module.exports = generateDefinitions;

	/**
	* Generates design document definitions
	*
	* @param dbUrl	A URL representing the database into which design documents should be passed
	* @param path	The path at which the view definition will be created
	* @param done	The callback to be invoked on complection
	*/
	function generateDefinitions(dbUrl, path, done) {
		done = done || function () { };
		path = path || (process.cwd() + "/views.js");

		try {
			var db = nano(dbUrl);
		} catch (err) {
			console.log("Error connecting to database: " + dbUrl);
			done(err);
		}

		db.list({ startkey: "_design/", endkey: "_design0", "include_docs": true }, function (err, body) {
			if (err) {
				console.log(err);
				done(err);
				return;
			}

			fs.writeFile(path, generateScript(body), function (err) {
				if (err) {
					console.log(err);
				} else {
					console.log("Generated " + path);
				}

				done(err);
			});
		});
	}

	function generateScript(body) {
		var script = "/*global exports:true*/\n\n" +
				"(function(exports) {\n" +
				"    \"use strict\";";

		for (var i = 0; i < body.rows.length; i++) {
			var name = body.rows[i].id.replace("_design/", ""),
				doc = body.rows[i].doc;

			script += "\n\n    exports." + name + " = {\n" +
				"        views: {\n";
			for (var view in doc.views) {
				script += "            " + view + ": {\n";
				if (doc.views[view].map) {
					script += "                 map: " + doc.views[view].map.toString() + ",\n";
				}
				if (doc.views[view].reduce) {
					script += "                 reduce: " + doc.views[view].reduce.toString() + ",\n";
				}
				script += "            },\n";
			}

			script += "        },\n"

			if (doc.filters) {
				script += "        filters: {\n";
				for (var filter in doc.filters) {
					script += "            " + filter + ": " + doc.filters[filter].toString() + ",\n";
				}

				script += "        }\n"
			}
			script += "    };";
		}

		script += "\n}(exports || (window.designDocuments = window.designDocuments || {})));";

		return script;
	}
}(require, module));