"use strict";

const test               = require("tape")
    , { setup, teardown } = require("../promise");

test("Should", t => {
	setup();

	Promise.resolve().then(() => {
		const stackItems = new Error("Test").stack.split("\n");

		t.test("Bridge stacks among 'then'", t => {
			t.equal(stackItems[1].endsWith(`${ __filename }:10:22)`), true);
			t.equal(stackItems[2], "From previous event:");
			t.equal(stackItems[3].endsWith(`${ __filename }:9:20)`), true);
			t.end();
		});

		teardown();
		t.end();
	});
});
