// Credit: https://github.com/AndreasMadsen/stack-chain/blob/001f69e35ecd070c68209d13c4325fe5d23fc136/format.js

"use strict";

const toShortString = require("es5-ext/to-short-string-representation");

module.exports = error => {
	try { return Error.prototype.toString.call(error); }
	catch (e) { return `<error: ${ toShortString(e) }>`; }
};
