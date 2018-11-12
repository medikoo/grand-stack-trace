"use strict";

const test             = require("tape")
    , configurePromise = require("../../../configure/promise-implementation/constructor-methods");

test("configure/promise-implementaton/constructor-methods", t => {
	const { setup, teardown } = configurePromise(Promise);
	setup();

	Promise.all([{ then(onFulfilled) { onFulfilled(new Error("Test").stack.split("\n")); } }])
		.then(([stackItems]) => {
			t.test("Should bridge stacks among 'all'", t => {
				t.equal(stackItems[1].endsWith(`${ __filename }:10:49)`), true);
				t.equal(stackItems[2], "From previous event:");
				t.equal(stackItems[3].endsWith(`${ __filename }:10:10)`), true);
				t.end();
			});
			return Promise.race([
				{ then(onFulfilled) { onFulfilled(new Error("Test").stack.split("\n")); } }
			]);
		})
		.then(stackItems => {
			t.test("Should bridge stacks among 'race'", t => {
				t.equal(stackItems[1].endsWith(`${ __filename }:19:39)`), true);
				t.equal(stackItems[2], "From previous event:");
				t.equal(stackItems[3].endsWith(`${ __filename }:18:19)`), true);
				t.end();
			});
			return Promise.resolve({
				then(onFulfilled) { onFulfilled(new Error("Test").stack.split("\n")); }
			});
		})
		.then(stackItems => {
			t.test("Should bridge stacks among 'resolve'", t => {
				t.equal(stackItems[1].endsWith(`${ __filename }:30:37)`), true);
				t.equal(stackItems[2], "From previous event:");
				t.equal(stackItems[3].endsWith(`${ __filename }:29:19)`), true);
				t.end();
			});
			teardown();
			t.end();
		});
});
