
import { statusKey, Status } from './Status.js';


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
    // May be `null` if not yet loaded
    [itemKey] : null | T,
    
    [statusKey] : Status & StatusMethods<T>,
};
