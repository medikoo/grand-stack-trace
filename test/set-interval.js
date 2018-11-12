"use strict";

const test                = require("tape")
    , { setup, teardown } = require("../set-interval");

test("set-interval", t => {
	setup();

	let stackItems;
	const id = setInterval(() => {
		clearInterval(id);
		stackItems = new Error("Test").stack.split("\n");
		t.test("bridge stacks", t => {
			t.equal(stackItems[1].endsWith(`${ __filename }:12:16)`), true);
			t.equal(stackItems[2], "From previous event:");
			t.equal(stackItems[3].endsWith(`${ __filename }:10:13)`), true);
			t.end();
		});

		teardown();
		t.end();
	});
});
