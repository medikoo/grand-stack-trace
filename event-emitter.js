"use strict";

const { EventEmitter: { prototype: eePrototype } } = require("events")
    , configure                                  = require("./configure");

const onConfig = configure(eePrototype, "on", { callbackIndex: 1 });
const addListenerConfig = configure(eePrototype, "addListener", { callbackIndex: 1 });

module.exports = {
	setup() {
		onConfig.setup();
		addListenerConfig.setup();
	},
	restore() {
		onConfig.restore();
		addListenerConfig.restore();
	}
};
