[![*nix build status][nix-build-image]][nix-build-url]
[![Windows build status][win-build-image]][win-build-url]
[![Tests coverage][cov-image]][cov-url]
![Transpilation status][transpilation-image]
[![npm version][npm-image]][npm-url]

# grand-stack-trace

## Debugging (non-production) purpose long stack traces

Why? Because all other long-stack-\* solutions seem out of date and do not work as expected in recent versions of Node.js

Additionally this one stands on modular approach, it can be fine tuned, which async endpoints should have stack trace bridges ensured.

### Supported engines

All V8 based:

-   Google Chrome
-   Node.js

#### What about other engines?

With [`Error.prepareStackTrace`](https://github.com/v8/v8/wiki/Stack-Trace-API#customizing-stack-traces) well polyfilled, they may work

### Supported async endpoints:

-   `setImmediate`
-   `setTimeout`
-   `setInterval`
-   `process.nextTick`
-   `EventEmitter.on` and `EventEmitter.addListener`

### What about promises?

Override native `Promise` with [Bluebird](http://bluebirdjs.com/)

```javascript
global.Promise = require("bluebird");
Promise.config({ longStackTraces: true });
```

#### What about async/await?

Transpile out of it with [Babel](https://babeljs.io/setup#installation), relying on following `.babelrc` configuration

```json
{ "plugins": ["transform-async-to-generator"] }
```

### Usage

At beginning of main module of program you wish to debug add:

```javascript
require("grand-stack-trace");
```

Or you may just pick chosen async endpoints, e.g.

```javascript
require("grand-stack-trace/set-immediate");
require("grand-stack-trace/event-emitter");
```

### Tests

    $ npm test

[nix-build-image]: https://semaphoreci.com/api/v1/medikoo-org/grand-stack-trace/branches/master/shields_badge.svg
[nix-build-url]: https://semaphoreci.com/medikoo-org/grand-stack-trace
[win-build-image]: https://ci.appveyor.com/api/projects/status/?svg=true
[win-build-url]: https://ci.appveyor.com/project/medikoo/grand-stack-trace
[cov-image]: https://img.shields.io/codecov/c/github/medikoo/grand-stack-trace.svg
[cov-url]: https://codecov.io/gh/medikoo/grand-stack-trace
[transpilation-image]: https://img.shields.io/badge/transpilation-free-brightgreen.svg
[npm-image]: https://img.shields.io/npm/v/grand-stack-trace.svg
[npm-url]: https://www.npmjs.com/package/grand-stack-trace
