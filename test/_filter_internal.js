"use strict";

const isCallSiteFileNameInternal = require("../lib/private/is-call-site-file-name-internal");

const filenameRe = /\((.+):\d+:\d+\)$/u;

module.exports = stackItems =>
	stackItems.filter(stackItem => {
		if (stackItem.endsWith(":")) return true;
		const filenameMatch = stackItem.match(filenameRe);
		if (!filenameMatch) return false;
		return !isCallSiteFileNameInternal(filenameMatch[1]);
	});
