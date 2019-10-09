
import { statusKey, Status } from './status.js';


/*
Loadable: any object that specifies a `status`.
*/

export const itemKey = Symbol('lifecycle.item');

export type StatusMethods<T> = {
    asReady : (item : T) => Loadable<T>,
    asFailed : (reason : Error) => Loadable<T>,
    asLoading : () => Loadable<T>,
};

export type Loadable<T> = {
    [itemKey] : T,
    [statusKey] : Status & StatusMethods<T>,
};
