"use strict";

const ensureObject        = require("es5-ext/object/valid-object")
    , ensureNaturalNumber = require("es5-ext/object/ensure-natural-number-value")
    , ensurePlainFunction = require("es5-ext/object/ensure-plain-function")
    , ensurePropertyKey   = require("es5-ext/object/valid-value")
    , init                = require("./init-async-handler");

require("./internal-file-names").add(__filename);

module.exports = (object, asyncMethodName, { callbackIndex }) => {
	ensureObject(object);
	asyncMethodName = ensurePropertyKey(asyncMethodName);
	callbackIndex = ensureNaturalNumber(callbackIndex);

	const asyncMethod = ensurePlainFunction(object[asyncMethodName]);

	const asyncMethodWrapper = function (...asyncMethodArgs) {
		const callback = ensurePlainFunction(asyncMethodArgs[callbackIndex]);
		const { before, after } = init();
		asyncMethodArgs[callbackIndex] = function (...callbackArgs) {
			before();
			try { return callback.call(this, ...callbackArgs); }
			finally { after(); }
		};
		return asyncMethod.apply(this, asyncMethodArgs);
	};
	return {
		setup() { object[asyncMethodName] = asyncMethodWrapper; },
		restore() { object[asyncMethodName] = asyncMethod; }
	};
};
