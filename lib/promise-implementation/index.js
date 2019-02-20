"use strict";

const ensureFunction          = require("es5-ext/function/valid-function")
    , setupInstanceMethods    = require("./instance-methods")
    , setupConstructorMethods = require("./constructor-methods");

module.exports = PromiseConstructor => {
	ensureFunction(PromiseConstructor);
	const constructorMethodsHook = setupConstructorMethods(PromiseConstructor)
	    , instanceMethodsHook = setupInstanceMethods(PromiseConstructor);

	return {
		setup() {
			constructorMethodsHook.setup();
			instanceMethodsHook.setup();
		},
		teardown() {
			constructorMethodsHook.teardown();
			instanceMethodsHook.teardown();
		}
	};
};
