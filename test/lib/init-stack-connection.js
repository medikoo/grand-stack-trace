"use strict";

const test = require("tape")
    , init = require("../../lib/init-stack-connection");

test("configure/init-async-hooks", t => {
	const { before, after } = init();

	before();
	const stackItems = new Error("Foo").stack.split("\n");
	before();
	after();
	after();

	t.test("Should bridge stacks", t => {
		t.equal(stackItems[1].endsWith(`${ __filename }:10:21)`), true);
		t.equal(stackItems[2], "From previous event:");
		t.equal(stackItems[3].endsWith(`${ __filename }:7:28)`), true);
		t.end();
	});
	t.test("Should resolve top message", t => {
		t.equal(stackItems[0], "Error: Foo");
		t.end();
	});

	const syncStackItems = new Error("Foo").stack.split("\n");
	t.test("Should handle recursive async operations", t => {
		t.equal(syncStackItems[1].endsWith(`${ __filename }:26:25)`), true);
		t.notEqual(syncStackItems[2], "From previous event:");
		t.end();
	});
	t.end();
});
