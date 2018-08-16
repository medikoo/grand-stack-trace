"use strict";

const ensureCallable = require("es5-ext/object/valid-callable")
    , init           = require("./configure/init-async-hook");

require("./configure/filtered-stack-module-names").add(__filename);

const asyncMethod = process.nextTick;

const asyncMethodWrapper = function (handler, ...args) {
	ensureCallable(handler);
	const { before, after } = init();
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
	restore() { process.nextTick = asyncMethod; }
};
