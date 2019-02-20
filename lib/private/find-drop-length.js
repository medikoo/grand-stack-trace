"use strict";

const isCallSiteSame = (callSiteA, callSiteB) =>
	callSiteA.getFileName() === callSiteB.getFileName() &&
	callSiteA.getLineNumber() === callSiteB.getLineNumber() &&
	callSiteA.getColumnNumber() === callSiteB.getColumnNumber();

module.exports = (beforeCallSites, currentCallSites) => {
	const beforeLastIndex = beforeCallSites.length - 1
	    , currentLastIndex = currentCallSites.length - 1;
	let length = 0;
	while (
		beforeCallSites[beforeLastIndex - length] &&
		isCallSiteSame(
			beforeCallSites[beforeLastIndex - length], currentCallSites[currentLastIndex - length]
		)
	) {
		++length;
	}

	return length;
};
