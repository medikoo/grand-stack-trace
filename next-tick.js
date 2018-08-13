"use strict";

const configure = require("./configure/async-method");

module.exports = configure(process, "nextTick", { callbackIndex: 0 });
