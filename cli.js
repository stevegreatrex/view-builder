#!/usr/bin/env node

(function(require) {
	var args = require("optimist").argv;

	if ("generate" in args){
		require("./generate.js")(args.url, args.defs);
	} else {
		require("./builder.js")(args.url, args.defs, args.force);
	}
}(require));