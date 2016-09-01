'use strict';

let assert = require('assert');

let keywordRule = require('../src/parser/keywordInPage');

let jsdom = require('jsdom');

describe('keyword', () => {
    it('base', (done) => {
        jsdom.env('<html><body><p>abc</p></body></html>', (err, win) => {
            global.window = win;
            global.document = win.document;
            keywordRule(['abc']);
            done();
        });
    });

    it('base:error', (done) => {
        jsdom.env('<html><body><p>abc</p></body></html>', (err, win) => {
            global.window = win;
            global.document = win.document;
            try {
                keywordRule(['llomk']);
            } catch (err) {
                assert.equal(err.toString().indexOf('missing keyword') !== -1, true);
                done();
            }
        });
    });
});
