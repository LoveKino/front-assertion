'use strict';

let {
    assertLastState, getBeforeNextActionRun,
    assertBeforeState, assertAfterState
} = require('./assertion');

let {
    delay
} = require('jsenhance');

module.exports = (opts, {
    model
}) => {
    let {
        getFragments, getLastAction
    } = model;

    // split nodes
    let fragments = getFragments(opts.passData.nodes);

    let assertions = [];

    let appendAssertion = (assertion) => {
        assertions.push(assertion);
        // TODO throw error right away

        return assertion;
    };

    return {
        beforeRunAction: (action) => {
            // assert before state
            return appendAssertion(assertBeforeState(action.beforeState, {
                log: opts.log
            }));
        },

        afterRunAction: (action) => {
            // assert after state
            return appendAssertion(assertAfterState(action.afterState, {
                log: opts.log
            }));
        },

        afterPlay: () => {
            // finished all actions
            let nodeLen = opts.passData.nodes.length;
            let action = getLastAction(fragments);
            let delayTime = 3000;

            let lastState = null;
            if (nodeLen === 1) {
                lastState = opts.passData.nodes[0];
            } else if (action) {
                lastState = action.afterState;
            }

            if (lastState) {
                if (getBeforeNextActionRun(lastState).length) {
                    // add last state assertion
                    // TODO delayTime from recording
                    // record close recoding window time
                    appendAssertion(
                        assertLastState(lastState, {
                            log: opts.log,
                            delayTime
                        })
                    );
                }
            }

            // TODO hack: wait delayTime, before finished. May refresh page, so wait some time.
            return delay(delayTime).then(() => {
                return Promise.all(assertions);
            });
        }
    };
};
