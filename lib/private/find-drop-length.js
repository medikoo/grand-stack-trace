"use strict";

const isCallSiteSame = (callSiteA, callSiteB) =>
	callSiteA.getFileName() === callSiteB.getFileName() &&
	callSiteA.getLineNumber() === callSiteB.getLineNumber() &&
	callSiteA.getColumnNumber() === callSiteB.getColumnNumber();

module.exports = (dropCallSites, currentCallSites) => {
	const dropLastIndex = dropCallSites.length - 1, currentLastIndex = currentCallSites.length - 1;
	let length = 0;
	while (
		dropCallSites[dropLastIndex - length] &&
		isCallSiteSame(
			dropCallSites[dropLastIndex - length], currentCallSites[currentLastIndex - length]
		)
	) {
		++length;
	}

	return length;
};
