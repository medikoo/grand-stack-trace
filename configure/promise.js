"use strict";

const ensureFunction = require("es5-ext/function/valid-function")
    , isCallable     = require("es5-ext/object/is-callable")
    , init           = require("./init-async-hook");

const { call } = Function.prototype;

require("./internal-file-names").add(__filename);

const getCatchFinallyWrapper = asyncMethod =>
	function (onResolved, ...args) {
		if (!isCallable(onResolved)) return asyncMethod.call(this, onResolved, ...args);
		const { before, after } = init();
		return asyncMethod.call(
			this,
			function (...callbackArgs) {
				before();
				try { return call.call(onResolved, this, ...callbackArgs); }
				finally { after(); }
			},
			...args
		);
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
		const { before, after } = init();
		return thenMethod.call(
			this,
			isCallable(onFulfilled)
				? function (...callbackArgs) {
						before();
						try { return call.call(onFulfilled, this, ...callbackArgs); }
						finally { after(); }
				  }
				: onFulfilled,
			isCallable(onRejected)
				? function (...callbackArgs) {
						before();
						try { return call.call(onRejected, this, ...callbackArgs); }
						finally { after(); }
				  }
				: onRejected,
			...args
		);
	};
	const catchMethodWrapper = getCatchFinallyWrapper(catchMethod);
	const finallyMethodWrapper = getCatchFinallyWrapper(finallyMethod);
	return {
		setup() {
			PromiseConstructor.prototype.then = thenMethodWrapper;
			PromiseConstructor.prototype.catch = catchMethodWrapper;
			PromiseConstructor.prototype.finally = finallyMethodWrapper;
		},
		restore() {
			PromiseConstructor.prototype.then = thenMethod;
			PromiseConstructor.prototype.catch = catchMethod;
			PromiseConstructor.prototype.finally = finallyMethod;
		}
	};
};
