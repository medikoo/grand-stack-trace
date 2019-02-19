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
    , formatErrorString = require("../lib/private/format-error-string");

internalFileNames.add(__filename);

let bridge = null, isBareRequested = false;

const filterInternalTrace = structuredStackTrace =>
	structuredStackTrace.filter(callSite => !internalFileNames.has(callSite.getFileName()));

const prepareDrop = (error, structuredStackTrace) => structuredStackTrace;

const isCallSiteSame = (callSiteA, callSiteB) =>
	callSiteA.getFileName() === callSiteB.getFileName() &&
	callSiteA.getLineNumber() === callSiteB.getLineNumber() &&
	callSiteA.getColumnNumber() === callSiteB.getColumnNumber();

const findDropLength = current => {
	const { drop } = bridge, dropLastIndex = drop.length - 1, currentLastIndex = current.length - 1;
	let length = 0;
	while (
		drop[dropLastIndex - length] &&
		isCallSiteSame(drop[dropLastIndex - length], current[currentLastIndex - length])
	) {
		++length;
	}

	return length;
};

const prepareStackTrace = (error, structuredStackTrace) => {
	if (bridge && bridge.drop) {
		const dropLength = findDropLength(structuredStackTrace);
		if (!dropLength) {
			const message =
				"Unexpected stack state: registered drop not present in current stack\n" +
				`    Bridge name: ${ bridge.name }\n    Drop:\n        ${
					bridge.drop.join("\n        ")
				}\n    Stack:\n        ${ structuredStackTrace.join("\n        ") }`;
			delete Error.prepareStackTrace;
			throw new Error(message);
		}
		structuredStackTrace = structuredStackTrace.slice(0, -dropLength);
	}
	structuredStackTrace = filterInternalTrace(structuredStackTrace).map(wrapCallSite);

	let stack = structuredStackTrace.map(callSite => `    at ${ callSite }`).join("\n");
	if (bridge) stack += `\nFrom previous event:\n${ bridge.stack }`;
	if (isBareRequested) return stack;
	return `${ formatErrorString(error) }\n${ stack }`;
};

const getPreparedStack = prepare => {
	const previousPrepare = Error.prepareStackTrace;
	Error.prepareStackTrace = prepare;
	try { return new Error().stack; }
	finally { Error.prepareStackTrace = previousPrepare; }
};

const getBareStack = () => {
	isBareRequested = true;
	try { return getPreparedStack(prepareStackTrace); }
	finally { isBareRequested = false; }
};

module.exports = (name, options = { skipDrop: false }) => {
	const previousStack = getBareStack(), shadowedStates = [];
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
