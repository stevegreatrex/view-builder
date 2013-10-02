#!/usr/bin/env node

(function(require) {
	var url = process.argv[2],
		viewFile = process.argv[3];

	for (var i = 0; i < process.argv.length; i++) {
		if (process.argv[i].toLowerCase() === "--generate") {
			require("./generate.js")(url, viewFile);
			return;
		}
	}
	
	require("./builder.js")(url, viewFile);
}(require));