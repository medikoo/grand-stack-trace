"use strict";

const test               = require("tape")
    , { setup, restore } = require("../set-interval");

test("Should", t => {
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

		restore();
		t.end();
	});
});
