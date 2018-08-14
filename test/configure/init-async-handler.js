"use strict";

const test = require("tape")
    , init = require("../../configure/init-async-handler");

test("Should", t => {
	const { before, after } = init();

	before();
	const stackItems = new Error("Foo").stack.split("\n");
	after();

	t.test("Bridge stacks", t => {
		t.equal(stackItems[1].endsWith(`${ __filename }:10:21)`), true);
		t.equal(stackItems[2], "From previous event:");
		t.equal(stackItems[3].endsWith(`${ __filename }:7:28)`), true);
		t.end();
	});
	t.test("Resolve top message", t => {
		t.equal(stackItems[0], "Error: Foo");
		t.end();
	});

	t.end();
});
