// Hooks for Node.js EventEtmitter

"use strict";

const { EventEmitter: { prototype: eePrototype } } = require("events")
    , ensureCallable                             = require("es5-ext/object/valid-callable")
    , init                                       = require("./configure/init-async-hook");

require("./configure/stack-filtered-module-names").add(__filename);

const asyncMethod = eePrototype.on;

const asyncMethodWrapper = function (type, handler, ...args) {
	ensureCallable(handler);
	const { before, after } = init();
	return asyncMethod.call(
		this,
		type,
		function (...callbackArgs) {
			before();
			try { return handler.call(this, ...callbackArgs); }
			finally { after(); }
		},
		...args
	);
};
module.exports = {
	setup() { eePrototype.on = eePrototype.addListener = asyncMethodWrapper; },
	teardown() { eePrototype.on = eePrototype.addListener = asyncMethod; }
};
