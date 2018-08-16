"use strict";

const test              = require("tape")
    , internalFileNames = require("../../configure/stack-filtered-module-names");

test("Should be set", t => {
	t.equal(internalFileNames instanceof Set, true);
	t.end();
});
