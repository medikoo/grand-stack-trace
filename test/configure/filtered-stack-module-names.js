"use strict";

const test              = require("tape")
    , internalFileNames = require("../../configure/filtered-stack-module-names");

test("Should be set", t => {
	t.equal(internalFileNames instanceof Set, true);
	t.end();
});
