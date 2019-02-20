// Hooks for any async operations within Node.js v8+ proceses

"use strict";

const asyncHooks = require("async_hooks")
    , init       = require("./lib/init-stack-connection");

require("./lib/stack-filtered-file-names").add(__filename).add("internal/async_hooks.js");

const hooks = new Map();

const after = id => {
	const hook = hooks.get(id);
	if (!hook) return;
	hook.after();
	hooks.delete(id);
};
const asyncHook = asyncHooks.createHook({
	init(id) { hooks.set(id, init("async-hooks", { isInternallyInitialized: true })); },
	before(id) {
		const hook = hooks.get(id);
		if (hook) hook.before();
	},
	after,
	destroy: after,
	promiseResolve: after
});

module.exports = { setup: () => asyncHook.enable(), teardown: () => asyncHook.disable() };
