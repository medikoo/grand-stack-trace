// Configure hooks for provided Promise implementation constructor methods

"use strict";

const ensureFunction    = require("es5-ext/function/valid-function")
    , isValue           = require("es5-ext/object/is-value")
    , init              = require("../init-async-hook")
    , configureThenable = require("../../lib/configure-thenable");

require("../stack-filtered-module-names").add(__filename);

// Rely on internal memoize util, to ensure its operations are hidden from stack trace
const memoize = fn => {
	let result;
	return () => {
		if (result) return result;
		return result = fn("promise-constructor");
	};
};

const getCollectionMethodWrapper = asyncMethod =>
	function (iterable, ...args) {
		if (!isValue(iterable) || !iterable[Symbol.iterator]) {
			return asyncMethod.call(this, iterable, ...args);
		}
		const itemInit = memoize(init);
		const items = [];
		for (const item of iterable) items.push(configureThenable(item, itemInit));
		return asyncMethod.call(this, items, ...args);
	};

module.exports = PromiseConstructor => {
	ensureFunction(PromiseConstructor);
	const allMethod = ensureFunction(PromiseConstructor.all);
	const raceMethod = ensureFunction(PromiseConstructor.race);
	const resolveMethod = ensureFunction(PromiseConstructor.resolve);

	const allMethodWrapper = getCollectionMethodWrapper(allMethod);
	const raceMethodWrapper = getCollectionMethodWrapper(raceMethod);
	const resolveMethodWrapper = function (value, ...args) {
		return resolveMethod.call(this, configureThenable(value, init), ...args);
	};
	return {
		setup() {
			PromiseConstructor.all = allMethodWrapper;
			PromiseConstructor.race = raceMethodWrapper;
			PromiseConstructor.resolve = resolveMethodWrapper;
		},
		teardown() {
			PromiseConstructor.all = allMethod;
			PromiseConstructor.race = raceMethod;
			PromiseConstructor.resolve = resolveMethod;
		}
	};
};
