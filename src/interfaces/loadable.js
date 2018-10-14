// @flow

import statusKey, { type Status } from './status.js';


/*
Loadable: any JavaScript value that specifies a `status`.
*/

export type Loadable = {
    [statusKey] : Status,
};
