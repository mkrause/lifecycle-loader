// @flow

import status from '../status.js';
import type { Status } from '../status.js';


/*
Loadable: any item that defines the `status` property.
*/

export type Loadable = {
    [status] : Status,
};

// The most basic way to create a Loadable: just wrap it in an object
export const fromStatus = (status : Status, item : mixed) => ({
    [status]: status,
    item,
});
