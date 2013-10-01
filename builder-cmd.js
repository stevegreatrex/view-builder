#!/usr/bin/env node

(function(require) {
	var url = process.argv[2],
		viewFile = process.argv[3];
	require("./builder.js")(url, viewFile);
}(require));