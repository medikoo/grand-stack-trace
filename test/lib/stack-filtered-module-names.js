"use strict";

const test              = require("tape")
    , internalFileNames = require("../../lib/stack-filtered-module-names");

test("configure/stack-filtered-module-names", t => {
	t.equal(internalFileNames instanceof Set, true);
	t.end();
});
