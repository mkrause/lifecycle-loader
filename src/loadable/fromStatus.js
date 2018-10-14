// @flow

import statusKey, { type Status } from '../interfaces/status.js';
import { type Loadable } from '../interfaces/Loadable.js';


// The most basic way to create a Loadable: just wrap it in an object
const fromStatus = (status : Status, item : mixed) : Loadable => ({
    [statusKey]: status,
    item,
});

export default fromStatus;
