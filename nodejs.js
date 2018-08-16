// Hooks for any async operations within Node.js v8+ proceses

"use strict";

const asyncHooks = require("async_hooks")
    , init       = require("./configure/init-async-hook");

require("./configure/stack-filtered-module-names")
	.add(__filename)
	.add("internal/async_hooks.js")
	.add("internal/timers.js")
	.add("internal/process/next_tick.js")
	.add("timers.js");

const hooks = new Map();

const after = id => {
	const hook = hooks.get(id);
	if (!hook) return;
	hook.after();
	hooks.delete(id);
};
const asyncHook = asyncHooks.createHook({
	init(id) { hooks.set(id, init()); },
	before(id) {
		const hook = hooks.get(id);
		if (hook) hook.before();
	},
	after,
	destroy: after,
	promiseResolve: after
});

module.exports = { setup: () => asyncHook.enable(), restore: () => asyncHook.disable() };
