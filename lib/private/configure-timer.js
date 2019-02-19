// Hooks configuration for timers (setTimeout, setInterval & setImmediate functions)

"use strict";

const global         = require("es5-ext/global")
    , isCallable     = require("es5-ext/object/is-callable")
    , ensureCallable = require("es5-ext/object/valid-callable")
    , init           = require("../../configure/init-async-hook");

require("../../configure/stack-filtered-module-names").add(__filename);

module.exports = asyncMethodName => {
	const asyncMethod = global[asyncMethodName];
	let isCodeSupported = true;
	try { asyncMethod("Object"); }
	catch (error) { isCodeSupported = false; }

	const asyncMethodWrapper = function (handler, ...args) {
		if (!isCodeSupported) ensureCallable(handler);
		if (!isCallable(handler)) {
			const code = `${ handler }`;
			// eslint-disable-next-line no-eval
			handler = () => eval(code);
		}
		const { before, after } = init("timer");
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
	return {
		setup() { global[asyncMethodName] = asyncMethodWrapper; },
		teardown() { global[asyncMethodName] = asyncMethod; }
	};
};
