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
let assertBeforeState = (beforeState, {
    log
}) => {
    let beforeNextActionRun = getBeforeNextActionRun(beforeState);

    return Promise.all(map(beforeNextActionRun, (assertion, index) => {
        let {
            type, content
        } = assertion;
        // run assertion
        let ret = runAssertion(assertion, {
            index,
            type: 'beforeNextActionRun', stateId: beforeState.id
        });
        ret = Promise.resolve(ret);

        // log
        return ret.then((res) => {
            log(`[assertion pass] Assertion type is ${type}. Assertion content is ${JSON.stringify(content, null, 4)}.`);
            return res;
        }).catch(err => {
            log(`[assertion fail] Assertion type is ${type}. Assertion content is ${JSON.stringify(content, null, 4)}. Error message ${err}`);
            throw err;
        });
    }));
};

let getBeforeNextActionRun = (state) => {
    let assertion = state.assertion || {};
    let beforeNextActionRun = assertion.beforeNextActionRun || [];
    return beforeNextActionRun;
};

let assertAfterState = (afterState) => {
    let assertion = afterState.assertion || {};
    let asyncTime = assertion.asyncTime || [];
    return assertAsyncTime(asyncTime, afterState);
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

let assertAsyncTime = (asyncTime, state) => {
    return Promise.all(map(asyncTime, (assertion, index) => {
        let {
            time = 0
        } = assertion;
        return delay(time).then(() => runAssertion(assertion, {
            index,
            type: 'asyncTime', stateId: state.id
        }));
    }));
};

let runAssertion = ({
    type, content, opts
}, assertionMeta) => {
    try {
        let ret = parserMap[type](content, opts);
        return Promise.resolve(ret);
    } catch (err) {
        err.data = assertionMeta;
        assertionMeta.errorType = 'assertionFail';
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
