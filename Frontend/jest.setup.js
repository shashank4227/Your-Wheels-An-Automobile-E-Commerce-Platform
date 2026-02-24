// Polyfill for TextEncoder and TextDecoder in Node.js (for Jest testing)
import expect from 'expect';

// Optionally, you can also add this to explicitly define 'expect' if needed
global.expect = expect;
const { TextEncoder, TextDecoder } = require('util');



global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
