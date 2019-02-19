"use strict";

const isCallable = require("es5-ext/object/is-callable")
    , isObject   = require("es5-ext/object/is-object");

const { call } = Function.prototype, thenMethodsTypeRegistry = new WeakMap();
const isNativeThenDirect = RegExp.prototype.test.bind(
	/^function then\(\) \{\s+\[native code\]\s+\}$/u
);

require("../../configure/stack-filtered-module-names").add(__filename);

thenMethodsTypeRegistry.set(Promise.prototype.then, "native");

const isNativeThen = thenMethod => {
	let result;
	if (thenMethodsTypeRegistry.has(thenMethod)) {
		result = thenMethodsTypeRegistry.get(thenMethod) === "native";
	} else {
		result = isNativeThenDirect(thenMethod);
		thenMethodsTypeRegistry.set(thenMethod, result ? "native" : "custom");
	}
	return result;
};

module.exports = (thenable, initHook) => {
	if (!isObject(thenable)) return thenable;
	const { then } = thenable;
	if (!isCallable(then)) return thenable;
	if (isNativeThen(then)) return thenable; // No need to track native `then`
	const { before, after } = initHook("thenable");
	return {
		then(onFulfilled, onRejected, ...args) {
			before();
			try { return call.call(then, thenable, onFulfilled, onRejected, ...args); }
			finally { after(); }
		}
	};
};
