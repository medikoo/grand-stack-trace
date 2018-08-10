"use strict";

const global    = require("es5-ext/global")
    , configure = require("./configure");

module.exports = configure(global, "setTimeout", { callbackIndex: 0 });
