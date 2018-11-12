"use strict";

module.exports = stackItems =>
	stackItems.filter(stackItem => !stackItem.endsWith("at <anonymous>"));
