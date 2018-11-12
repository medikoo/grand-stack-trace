"use strict";

const test                = require("tape")
    , { EventEmitter }    = require("events")
    , { setup, teardown } = require("../event-emitter");

test("event-emitter", t => {
	setup();

	let stackItems;
	const emitter = new EventEmitter();
	let isFirst = true;
	emitter.on("test", () => {
		if (isFirst) {
			isFirst = false;
			emitter.emit("test");
			stackItems = new Error("Test").stack.split("\n");
		}
	});
	emitter.emit("test");

	t.test("Bridge stacks", t => {
		t.equal(stackItems[1].endsWith(`${ __filename }:17:17)`), true);
		t.equal(stackItems[2], "From previous event:");
		t.equal(stackItems[3].endsWith(`${ __filename }:13:10)`), true);
		t.end();
	});

	const syncStackItems = new Error("Test").stack.split("\n");
	t.test("Handle recursive emits", t => {
		t.equal(syncStackItems[1].endsWith(`${ __filename }:29:25)`), true);
		t.notEqual(syncStackItems[2], "From previous event:");
		t.end();
	});
	teardown();
	t.end();
});
