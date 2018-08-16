"use strict";

const test             = require("tape")
    , configurePromise = require("../../configure/promise-implementation");

test("Should", t => {
	const { setup, restore } = configurePromise(Promise);
	setup();

	const promise = Promise.resolve()
		.then(() => {
			const stackItems = new Error("Test").stack.split("\n");
			t.test("Bridge stacks among 'then'", t => {
				t.equal(stackItems[1].endsWith(`${ __filename }:12:23)`), true);
				t.equal(stackItems[2], "From previous event:");
				t.equal(stackItems[3].endsWith(`${ __filename }:11:4)`), true);
				t.end();
			});

			throw new Error("Force catch");
		})
		.catch(() => {
			const stackItems = new Error("Test").stack.split("\n");
			t.test("Bridge stacks among 'catch'", t => {
				t.equal(stackItems[1].endsWith(`${ __filename }:23:23)`), true);
				t.equal(stackItems[2], "From previous event:");
				t.equal(stackItems[3].endsWith(`${ __filename }:22:9)`), true);
				t.end();
			});
		});

	if (!promise.finally) {
		t.end();
		return;
	}
	promise.finally(() => {
		const stackItems = new Error("Test").stack.split("\n");
		t.test("Bridge stacks among 'finally'", t => {
			t.equal(stackItems[1].endsWith(`${ __filename }:37:22)`), true);
			t.equal(stackItems[2], "From previous event:");
			t.equal(stackItems[3].endsWith(`${ __filename }:36:17)`), true);
			t.end();
		});
		restore();
		t.end();
	});
});
