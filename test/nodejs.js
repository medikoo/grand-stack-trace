"use strict";

const test                = require("tape")
    , { setup, teardown } = require("../nodejs");

test("Should bridge stacks of", t => {
	setup();

	setImmediate(() => {
		const stackItems = new Error("Test").stack.split("\n");
		t.test("setImmediate", t => {
			t.equal(stackItems[1].endsWith(`${ __filename }:10:22)`), true);
			t.equal(stackItems[2], "From previous event:");
			t.equal(stackItems[3].endsWith(`${ __filename }:9:2)`), true);
			t.end();
		});
		Promise.resolve().then(() => {
			const stackItems = new Error("Test").stack.split("\n");
			t.test("promise.then", t => {
				t.equal(stackItems[1].endsWith(`${ __filename }:18:23)`), true);
				t.equal(stackItems[2], "From previous event:");
				t.equal(stackItems[4].endsWith(`${ __filename }:17:21)`), true);
				t.equal(stackItems[5], "From previous event:");
				t.equal(stackItems[6].endsWith(`${ __filename }:9:2)`), true);
				t.end();
			});

			process.nextTick(() => {
				const stackItems = new Error("Test").stack.split("\n");
				t.test("process.nextTick", t => {
					t.equal(stackItems[1].endsWith(`${ __filename }:29:24)`), true);
					t.equal(stackItems[2], "From previous event:");
					t.equal(stackItems[3].endsWith(`${ __filename }:28:12)`), true);
					t.equal(stackItems[4], "From previous event:");
					t.equal(stackItems[6].endsWith(`${ __filename }:17:21)`), true);
					t.equal(stackItems[7], "From previous event:");
					t.equal(stackItems[8].endsWith(`${ __filename }:9:2)`), true);
					t.end();
				});

				teardown();
				t.end();
			});
		});
	});
});
