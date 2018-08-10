"use strict";

// For this to work all stack trace frames need to be exposed
Error.stackTraceLimit = Infinity;

const ensureObject        = require("es5-ext/object/valid-object")
    , ensureNaturalNumber = require("es5-ext/object/ensure-natural-number-value")
    , ensurePlainFunction = require("es5-ext/object/ensure-plain-function")
    , ensurePropertyKey   = require("es5-ext/object/valid-value");

let bridge = null;

const filterInternalTrace = structuredStackTrace =>
	structuredStackTrace.filter(callSite => callSite.getFileName() !== __filename);

const prepareDrop = (error, structuredStackTrace) => filterInternalTrace(structuredStackTrace);

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
	structuredStackTrace = filterInternalTrace(structuredStackTrace);

	if (bridge) {
		const dropLength = findDropLength(structuredStackTrace);
		if (!dropLength) {
			const message =
				"Unexpected stack state: registered drop not present in current stack\n" +
				`Drop:${ bridge.drop.join("\n") }\nStack:${ structuredStackTrace.join("\n") }`;
			delete Error.prepareStackTrace;
			throw new Error(message);
		}

		structuredStackTrace = structuredStackTrace.slice(0, -dropLength);
	}

	let stack = `${ error.name }${ error.message ? ": " : "" }${ error.message }\n${
		structuredStackTrace.map(callSite => `    at ${ callSite }`).join("\n")
	}`;
	if (bridge) stack += `\nFrom previous event:\n${ bridge.stack }`;
	return stack;
};

const getPreparedStack = prepare => {
	const previousPrepare = Error.prepareStackTrace;
	Error.prepareStackTrace = prepare;
	try { return new Error().stack; }
	finally { Error.prepareStackTrace = previousPrepare; }
};

const getBareStack = () => {
	const stack = getPreparedStack(prepareStackTrace);
	return stack.slice(stack.indexOf("\n") + 1);
};

module.exports = (object, asyncMethodName, { callbackIndex }) => {
	ensureObject(object);
	asyncMethodName = ensurePropertyKey(asyncMethodName);
	callbackIndex = ensureNaturalNumber(callbackIndex);

	const asyncMethod = ensurePlainFunction(object[asyncMethodName]);

	const asyncMethodWrapper = function (...asyncMethodArgs) {
		const callback = ensurePlainFunction(asyncMethodArgs[callbackIndex]);
		const previousStack = getBareStack();
		asyncMethodArgs[callbackIndex] = function (...callbackArgs) {
			const previousBridge = bridge;
			bridge = { stack: previousStack, drop: getPreparedStack(prepareDrop) };
			const previousPrepare = Error.prepareStackTrace;
			Error.prepareStackTrace = prepareStackTrace;
			try {
				return callback.call(this, ...callbackArgs);
			} finally {
				bridge = previousBridge;
				Error.prepareStackTrace = previousPrepare;
			}
		};
		return asyncMethod.apply(this, asyncMethodArgs);
	};
	return {
		setup() { object[asyncMethodName] = asyncMethodWrapper; },
		restore() { object[asyncMethodName] = asyncMethod; }
	};
};
