"use strict";

const test              = require("tape")
    , internalFileNames = require("../../configure/internal-file-names");

test("Should be set", t => {
	t.equal(internalFileNames instanceof Set, true);
	t.end();
});
