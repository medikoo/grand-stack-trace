"use strict";

const global    = require("es5-ext/global")
    , configure = require("./configure/async-method");

module.exports = configure(global, "setInterval", { callbackIndex: 0 });
