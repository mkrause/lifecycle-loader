
import $msg from 'message-tag';
import extend, { proxyKey } from 'proxy-extend';


/*
A *status* is an object that describes the current loading state of some application state.

Status flags:
  - ready: indicates whether this item can be used or not (whether the data can be read safely)
  - loading: indicates whether we are currently in the process of loading this item
  - error: indicates that the last load attempt resulted in an error

Note that each of the flags is independent, rather than being a linear transition (e.g. loading -> ready).
This is so that we can, for example, start loading new data while keeping information such as an error
state, for UI purposes. All the possible combinations listed below.

- !ready + !loading + !error     "pending", nothing done yet, not even attempted to load
- !ready +  loading + !error     "loading", for the first time, no older data available
-  ready + !loading + !error     "idle", can use the data as needed
-  ready +  loading + !error     "reloading", loading but there is still data available to show
- !ready + !loading +  error     failed, and not yet any attempt to retry (no older data available)
- !ready +  loading +  error     failed, but we're currently retrying (no older data available)
-  ready + !loading +  error     failed, and not yet any attempt to retry (there is older data available)
-  ready +  loading +  error     failed, but we're currently retrying (there is older data available)
*/
export type Status = {
    loading : boolean,
    ready : boolean,
    error : null | Error,
};

export const itemKey = Symbol('lifecycle.loadable.item');
export const statusKey = Symbol('lifecycle.loadable.status');
export const constructKey = Symbol('lifecycle.loadable.construct');


export type Loadable<T> = {
    [itemKey] : null | T,
    [statusKey] : Status,
    [constructKey] : (item : null | T, status : Status) => Loadable<T>,
};


const defaultStatus : Status = { ready: false, loading: false, error: null };

export const LoadableSimple = <T>(item : null | T, status : Partial<Status> = {})
    : Loadable<T> & { item : null | T, status : Status } => {
        // Note: although technically `undefined` is a valid instantiation of `T`, we explicitly disallow `undefined`
        // as an item type (at runtime anyway). Reason: `undefined` is likely a bug rather than an actual item, and
        // also it is useful to be able to use `undefined` to signify "lack of an argument" in certain methods (see
        // `asReady` for example).
        if (typeof item === 'undefined') {
            throw new TypeError(`Could not construct LoadableSimple, given undefined`);
        }
        
        const statusWithDefaults = { ...defaultStatus, ...status };
        
        const loadable : Loadable<T> & { item : null | T, status : Status } = {
            item,
            status: statusWithDefaults,
            
            [itemKey]: item,
            [statusKey]: statusWithDefaults,
            [constructKey]: LoadableSimple,
        };
        
        return loadable;
    };


export type Proxyable = null | string | number | object;
type FromProxyable<T> =
    T extends null ? {}
        : T extends string ? String
        : T extends number ? Number
        : T;
export const LoadableProxy = <T extends Proxyable>(item : null | T, status : Partial<Status> = {})
    : Loadable<T> & FromProxyable<T> => {
        const statusWithDefaults = { ...defaultStatus, ...status };
        
        // Prevent proxying multiple times (to prevent bugs where an object is repeatedly proxied over and over)
        if (typeof item === 'object' && item !== null && proxyKey in item) {
            throw new TypeError($msg`Cannot create a LoadableProxy from an item which is already a LoadableProxy`);
            
            // TODO: maybe just unwrap the given proxy and override the status?
            //const { extension: { [itemKey]: _item, [statusKey]: _status } } = extend.unwrap(item);
        }
        
        return extend(item, {
            [itemKey]: item,
            [statusKey]: statusWithDefaults,
            [constructKey]: LoadableProxy,
        }) as (Loadable<T> & FromProxyable<T>);
    };


// Utility methods

export const asLoading = <T>(loadable : Loadable<T>) =>
    loadable[constructKey](loadable[itemKey], { ...loadable[statusKey], loading: true });
export const asReady = <T>(loadable : Loadable<T>, item ?: T) =>
    loadable[constructKey](
        typeof item === 'undefined' ? loadable[itemKey] : item,
        { ...loadable[statusKey], ready: true }
    );
export const asFailed = <T>(loadable : Loadable<T>, reason : Error) =>
    loadable[constructKey](loadable[itemKey], { ...loadable[statusKey], error: reason });
