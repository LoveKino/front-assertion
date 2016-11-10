'use strict';

/**
 * state assert data structure
 *
 * state {
 *   type: 'state',
 *   duration: [],
 *   assertion: {
 *      'beforeNextActionRun': [{
 *          type: '',
 *          content,
 *          opts
 *      }],
 *      'asyncTime': [{
 *          time,
 *          type: '',
 *          content,
 *          opts
 *      }],
 *      ...
 *   }
 * }
 */

/**
 * type: parser
 */
let parserMap = require('./parser');
let {
    map
} = require('bolzano');

// beforeNextActionRun assertion
let assertBeforeState = (beforeState, opts) => {
    let beforeNextActionRun = getBeforeNextActionRun(beforeState);

    return Promise.all(map(beforeNextActionRun, (assertion, index) => {
        // run assertion
        return runAssertion(assertion, {
            index,
            type: 'beforeNextActionRun', stateId: beforeState.id
        }, opts);
    }));
};

let getBeforeNextActionRun = (state) => {
    let assertion = state.assertion || {};
    let beforeNextActionRun = assertion.beforeNextActionRun || [];
    return beforeNextActionRun;
};

let assertAfterState = (afterState, opts) => {
    let assertion = afterState.assertion || {};
    let asyncTime = assertion.asyncTime || [];
    return assertAsyncTime(asyncTime, afterState, opts);
};

let assertLastState = (afterState, {
    log,
    delayTime = 3000
} = {}) => {
    return delay(delayTime).then(() => {
        return assertBeforeState(afterState, {
            log
        });
    });
};

let assertAsyncTime = (asyncTime, state, opts) => {
    return Promise.all(map(asyncTime, (assertion, index) => {
        let {
            time = 0
        } = assertion;
        return delay(time).then(() => runAssertion(assertion, {
            index,
            type: 'asyncTime', stateId: state.id
        }, opts));
    }));
};

let runAssertion = (assertion, assertionMeta, {
    log
}) => {
    let opts = assertion.opts || {};
    return new Promise((resolve, reject) => {
        let wrapErr = (err) => {
            assertionMeta.errorType = 'assertionFail';
            err.data = assertionMeta;
            log(`[assertion fail] type: ${assertion.type}, negation: ${opts.negation}, content: ${JSON.stringify(assertion.content)}`);
            reject(err);
        };

        let wrapRet = (ret) => {
            log(`[assertion pass] type: ${assertion.type}, negation: ${opts.negation}, content: ${JSON.stringify(assertion.content)}`);
            resolve(ret);
        };

        return executeAssertion(assertion).then((ret) => {
            // no exception happened
            if (opts.negation === 'yes') { // should negation
                wrapErr(new Error(`Negation rule fail. Negation is ${opts.negation}. No exception happened when run assertion ${assertion.type} ${JSON.stringify(assertion.content)}.`));
            } else {
                wrapRet(ret);
            }
        }).catch(err => {
            if (opts.negation === 'yes') {
                wrapRet();
            } else {
                wrapErr(err);
            }
        });
    });
};

let executeAssertion = ({
    type, content, opts
}) => {
    try {
        let ret = parserMap[type](content, opts);
        return Promise.resolve(ret);
    } catch (err) {
        return Promise.reject(err);
    }
};

let delay = (time) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
};

module.exports = {
    assertBeforeState,
    assertAfterState,
    assertLastState,
    getBeforeNextActionRun
};
