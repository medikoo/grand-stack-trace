"use strict";

const configure = require("./configure");

module.exports = configure(process, "nextTick", { callbackIndex: 0 });
