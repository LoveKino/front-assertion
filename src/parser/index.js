'use strict';

let keywordInPage = require('./keywordInPage');

let urlMatch = require('./urlMatch');

let code = require('./codeRule');

let pageElement = require('./pageElement');

module.exports = {
    keywordInPage,
    urlMatch,
    code,
    pageElement
};
