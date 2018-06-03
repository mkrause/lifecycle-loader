// @flow

/*
Run using:
    $ cp flow/index.js.flow lib-cjs
    $ flow check-contents ./flow/flow_test.js < ./flow/flow_test.js

NOTE: in order for this to work, lib-cjs must not be ignored in `.flowconfig`.
*/


// Note: if there's an error in the flow definition itself (index.js.flow), then flow will simply
// fall back to `any` and report "No errors". Enable the following to double check.
import { nonexistent } from '../lib-cjs/index.js';

import { status, Loadable } from '../lib-cjs/index.js';
import type { Status, LoadableT, LoadableTWithMethods } from '../lib-cjs/index.js';

const myStatus : Status = {
    ready: true,
    loading: false,
    error: null,
};

const myLoadable = Loadable(42);

// Should work: status methods
const myLoadableReady = myLoadable[status].asReady(42);
const myLoadableFailed = myLoadableReady[status].asFailed(new Error('Failed'));
