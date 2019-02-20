// Initializes hook for async operation, returns { after, before }  method which should
// be invoked for async callback we want to cover
// e.g. in case of setTimeout, `main` (exports) function should be invoked when we register
// callback to setTimeout, then `before` should be invoked right before setTimeout invokes its
// callback, and `after` should be invoked after callback returns

"use strict";

// For reliable outcome all stack trace frames need to be exposed
Error.stackTraceLimit = Infinity;

const isObject          = require("es5-ext/object/is-object")
    , { wrapCallSite }  = require("source-map-support")
    , internalFileNames = require("./stack-filtered-module-names")
    , formatErrorString = require("./private/format-error-string")
    , findDropLength    = require("./private/find-drop-length");

internalFileNames.add(__filename);

let bridge = null;

const filterInternalTrace = structuredStackTrace =>
	structuredStackTrace.filter(callSite => !internalFileNames.has(callSite.getFileName()));

const prepareDrop = (error, structuredStackTrace) => structuredStackTrace;

const prepareStackPart = (error, structuredStackTrace) => {
	// Disconnected is when stack for error had been retrieved in different async context
	// than one in which error was initialized
	// (until V8 introduces dedicated hook for error intialization there seems to be no workaround)
	let isDisconnected = false;
	if (bridge && bridge.drop) {
		const dropLength = findDropLength(bridge.drop, structuredStackTrace);
		if (dropLength) structuredStackTrace = structuredStackTrace.slice(0, -dropLength);
		else isDisconnected = true;
	}
	structuredStackTrace = filterInternalTrace(structuredStackTrace).map(wrapCallSite);

	let stack = structuredStackTrace.map(callSite => `    at ${ callSite }`).join("\n");
	if (bridge) {
		stack += isDisconnected
			? "\n[...Disconnected...]"
			: `\nFrom previous event:\n${ bridge.stack }`;
	}
	return stack;
};

const prepareStackTrace = (error, structuredStackTrace) =>
	`${ formatErrorString(error) }\n${ prepareStackPart(error, structuredStackTrace) }`;

const getPreparedStack = prepare => {
	const previousPrepare = Error.prepareStackTrace;
	Error.prepareStackTrace = prepare;
	try { return new Error().stack; }
	finally { Error.prepareStackTrace = previousPrepare; }
};

module.exports = (name, options = { skipDrop: false }) => {
	const previousStack = getPreparedStack(prepareStackPart), shadowedStates = [];
	if (!isObject(options)) options = {};
	return {
		before() {
			shadowedStates.push({ bridge, prepareStackTrace: Error.prepareStackTrace });
			bridge = {
				stack: previousStack,
				drop: options.skipDrop ? null : getPreparedStack(prepareDrop),
				name
			};
			Error.prepareStackTrace = prepareStackTrace;
		},
		after() {
			const stateToRestore = shadowedStates.pop();
			if (!stateToRestore) return;
			({ bridge } = stateToRestore);
			Error.prepareStackTrace = stateToRestore.prepareStackTrace;
		}
	};
};
