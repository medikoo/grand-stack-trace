"use strict";

const test               = require("tape")
    , { EventEmitter }   = require("events")
    , { setup, restore } = require("../event-emitter");

test("Should", t => {
	setup();

	let stackItems;
	const emitter = new EventEmitter();
	emitter.on("test", () => { stackItems = new Error("Test").stack.split("\n"); });
	emitter.emit("test");

	t.test("Bridge stacks", t => {
		t.equal(stackItems[1].endsWith(`${ __filename }:12:42)`), true);
		t.equal(stackItems[2], "From previous event:");
		t.equal(stackItems[3].endsWith(`${ __filename }:12:10)`), true);
		t.end();
	});

	restore();
	t.end();
});
