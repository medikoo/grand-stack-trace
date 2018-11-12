"use strict";

const test                = require("tape")
    , { setup, teardown } = require("../promise");

test("promise", t => {
	setup();

	Promise.all([{ then(onFulfilled) { onFulfilled(new Error("Test").stack.split("\n")); } }])
		.then(([stackItems]) => {
			t.test("Bridge stacks among 'Promise.all'", t => {
				t.equal(stackItems[1].endsWith(`${ __filename }:9:49)`), true);
				t.equal(stackItems[2], "From previous event:");
				t.equal(stackItems[3].endsWith(`${ __filename }:9:10)`), true);
				t.end();
			});
			return new Error("Test").stack.split("\n");
		})
		.then(stackItems => {
			t.test("Bridge stacks among 'promise.then'", t => {
				t.equal(stackItems[1].endsWith(`${ __filename }:17:11)`), true);
				t.equal(stackItems[2], "From previous event:");
				t.equal(stackItems[3].endsWith(`${ __filename }:10:4)`), true);
				t.end();
			});
			teardown();
			t.end();
		});
});
