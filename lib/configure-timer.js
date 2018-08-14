"use strict";

const global = require("es5-ext/global")
    , init   = require("../configure/init-async-handler");

require("../configure/internal-file-names").add(__filename);

module.exports = asyncMethodName => {
	const asyncMethod = global[asyncMethodName];

	const asyncMethodWrapper = function (handler, ...args) {
		if (typeof handler !== "function") {
			const code = `${ handler }`;
			// eslint-disable-next-line no-eval
			handler = () => eval(code);
		}
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
	return {
		setup() { global[asyncMethodName] = asyncMethodWrapper; },
		restore() { global[asyncMethodName] = asyncMethod; }
	};
};
