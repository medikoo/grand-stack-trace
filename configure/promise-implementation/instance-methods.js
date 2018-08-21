// Configure hooks for provided Promise implementation instance methods

"use strict";

const ensureFunction    = require("es5-ext/function/valid-function")
    , isCallable        = require("es5-ext/object/is-callable")
    , init              = require("../init-async-hook")
    , configureThenable = require("../../lib/configure-thenable");

const { call } = Function.prototype;

require("../stack-filtered-module-names").add(__filename);

const getCallbackHandler = (before, onResolved, after) =>
	function (...callbackArgs) {
		before();
		try { return configureThenable(call.call(onResolved, this, ...callbackArgs), init); }
		finally { after(); }
	};

const getCatchFinallyWrapper = asyncMethod =>
	function (onResolved, ...args) {
		if (!isCallable(onResolved)) return asyncMethod.call(this, onResolved, ...args);
		const { before, after } = init("promise-catch-finally");
		return asyncMethod.call(this, getCallbackHandler(before, onResolved, after), ...args);
	};

module.exports = PromiseConstructor => {
	ensureFunction(PromiseConstructor);
	const thenMethod = ensureFunction(PromiseConstructor.prototype.then);
	const catchMethod = ensureFunction(PromiseConstructor.prototype.catch);
	const finallyMethod = PromiseConstructor.prototype.finally;

	const thenMethodWrapper = function (onFulfilled, onRejected, ...args) {
		if (!isCallable(onFulfilled) && !isCallable(onRejected)) {
			return thenMethod.call(this, onFulfilled, onRejected, ...args);
		}
		const { before, after } = init("promise-then");
		return thenMethod.call(
			this,
			isCallable(onFulfilled) ? getCallbackHandler(before, onFulfilled, after) : onFulfilled,
			isCallable(onRejected) ? getCallbackHandler(before, onRejected, after) : onRejected,
			...args
		);
	};
	const catchMethodWrapper = getCatchFinallyWrapper(catchMethod);
	const finallyMethodWrapper = finallyMethod ? getCatchFinallyWrapper(finallyMethod) : null;
	return {
		setup() {
			PromiseConstructor.prototype.then = thenMethodWrapper;
			PromiseConstructor.prototype.catch = catchMethodWrapper;
			if (finallyMethod) PromiseConstructor.prototype.finally = finallyMethodWrapper;
		},
		teardown() {
			PromiseConstructor.prototype.then = thenMethod;
			PromiseConstructor.prototype.catch = catchMethod;
			if (finallyMethod) PromiseConstructor.prototype.finally = finallyMethod;
		}
	};
};
