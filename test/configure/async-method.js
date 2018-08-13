"use strict";

const test              = require("tape")
    , configureEndpoint = require("../../configure/async-method");

test("Should", t => {
	const dummyEmitter = {
		on(callback) { this.callback = callback; },
		emit(message) { this.callback(message); }
	};

	const originalDummyEmitter = { on: dummyEmitter.on, emit: dummyEmitter.emit };

	const { setup, restore } = configureEndpoint(dummyEmitter, "on", { callbackIndex: 0 });
	setup();

	let stackItems;
	dummyEmitter.on(message => { stackItems = new Error(message).stack.split("\n"); });
	dummyEmitter.emit("Test");

	t.test("Bridge stacks", t => {
		t.equal(stackItems[1].endsWith(`${ __filename }:18:44)`), true);
		t.equal(stackItems[2], "From previous event:");
		t.equal(stackItems[3].endsWith(`${ __filename }:18:15)`), true);
		t.end();
	});
	t.test("Resolve top message", t => {
		t.equal(stackItems[0], "Error: Test");
		t.end();
	});

	restore();
	t.test("allow to restore previous state", t => {
		t.equal(dummyEmitter.on, originalDummyEmitter.on);
		t.end();
	});
	t.end();
});
