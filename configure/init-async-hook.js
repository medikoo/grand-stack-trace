// Initializes hook for async operation, returns { after, before }  method which should
// be invoked for async callback we want to cover
// e.g. in case of setTimeout, `main` (exports) function should be invoked when we register
// callback to setTimeout, then `before` should be invoked right before setTimeout invokes its
// callback, and `after` should be invoked after callback returns

"use strict";

// For reliable outcome all stack trace frames need to be exposed
Error.stackTraceLimit = Infinity;

const internalFileNames = require("./stack-filtered-module-names");
internalFileNames.add(__filename);

let bridge = null;

const filterInternalTrace = structuredStackTrace =>
	structuredStackTrace.filter(callSite => !internalFileNames.has(callSite.getFileName()));

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

	if (bridge && bridge.drop.length) {
		const dropLength = findDropLength(structuredStackTrace);
		if (!dropLength) {
			const message =
				"Unexpected stack state: registered drop not present in current stack\n" +
				`    Drop:\n        ${ bridge.drop.join("\n        ") }\n    Stack:\n        ${
					structuredStackTrace.join("\n        ")
				}`;
			delete Error.prepareStackTrace;
			throw new Error(message);
		}
		structuredStackTrace = structuredStackTrace.slice(0, -dropLength);
	}

	let stack = `${ error }\n${
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

module.exports = () => {
	const previousStack = getBareStack(), shadowedStates = [];
	return {
		before() {
			shadowedStates.push({ bridge, prepareStackTrace: Error.prepareStackTrace });
			bridge = { stack: previousStack, drop: getPreparedStack(prepareDrop) };
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
