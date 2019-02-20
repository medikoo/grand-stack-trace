"use strict";

const isFileNameInternal = require("./is-call-site-file-name-internal")
    , filteredFileNames  = require("../stack-filtered-file-names");

module.exports = callSite => {
	const fileName = callSite.getFileName();
	if (module.exports.filterInternals && isFileNameInternal(fileName)) return false;
	return !filteredFileNames.has(fileName);
};

module.exports.filterInternals = false;
