"use strict";

const test               = require("tape")
    , { setup, teardown } = require("../set-immediate");

test("Should", t => {
	setup();

	let stackItems;
	setImmediate(() => {
		stackItems = new Error("Test").stack.split("\n");
		t.test("bridge stacks", t => {
			t.equal(stackItems[1].endsWith(`${ __filename }:11:16)`), true);
			t.equal(stackItems[2], "From previous event:");
			t.equal(stackItems[3].endsWith(`${ __filename }:10:2)`), true);
			t.end();
		});

		teardown();
		t.end();
	});
});
