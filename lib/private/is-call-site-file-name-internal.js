// Credit: Andreas Madsen
// https://github.com/AndreasMadsen/clarify/blob/c93da35971f6db8248771526320e50e480f7f45c/clarify.js

"use strict";

const { sep } = require("path");

module.exports = fileName =>
	!fileName || !fileName.includes(sep) || fileName.startsWith("internal");
