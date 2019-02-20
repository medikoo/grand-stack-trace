// Hooks for Node.js process.nextTick

"use strict";

const ensureCallable = require("es5-ext/object/valid-callable")
    , init           = require("./lib/init-async-hook");

require("./lib/stack-filtered-file-names").add(__filename);

const asyncMethod = process.nextTick;

const asyncMethodWrapper = function (handler, ...args) {
	ensureCallable(handler);
	const { before, after } = init("process-next-tick");
	return asyncMethod.call(
		this,
		function (...callbackArgs) {
			before();
			try { return handler.call(this, ...callbackArgs); }
			finally { after(); }
		},
		...args
	);
};
module.exports = {
	setup() { process.nextTick = asyncMethodWrapper; },
	teardown() { process.nextTick = asyncMethod; }
};
