'use strict';

const frontend = require('..');
const assert = require('assert').strict;

assert.strictEqual(frontend(), 'Hello from frontend');
console.info("frontend tests passed");
