
import $msg from 'message-tag';
import extend, { isProxyable } from 'proxy-extend';
import type { Proxyable, ProxyableExternal } from 'proxy-extend';


// An *item* is the data part of a resource (can be anything).
export type Item = unknown;

/*
A *status* is an object that describes the current loading state of some resource.

Status flags:
  - ready: indicates whether this resource can be used or not (whether the data can be read safely)
  - loading: indicates whether we are currently in the process of loading this resource
  - error: indicates that the last load attempt resulted in an error

Note that each of the flags is independent, rather than being a linear transition (e.g. loading -> ready).
This is so that we can, for example, start loading new data while keeping information such as an error
state, for UI purposes. All the possible combinations listed below.

- !ready + !loading + !error     "pending", nothing done yet, not even attempted to load
- !ready +  loading + !error     "loading", for the first time, no older data available
-  ready + !loading + !error     "ready" (or "idle"), can use the data as needed
-  ready +  loading + !error     "ready" (or "reloading"), ready but also loading an updated version
- !ready + !loading +  error     "failed", and not yet any attempt to retry (no older data available)
- !ready +  loading +  error     "failed", but we're currently retrying (no older data available)
-  ready + !loading +  error     "failed", and not yet any attempt to retry (there is older data available)
-  ready +  loading +  error     "failed", but we're currently retrying (there is older data available)
*/
export type Status = {
    ready : boolean,
    loading : boolean,
    error : null | Error,
};
const defaultStatus : Status = { ready: false, loading: false, error: null };


// Property key symbols
export const itemKey = Symbol.for('lifecycle.loadable.item');
export const statusKey = Symbol.for('lifecycle.loadable.status');
export const constructKey = Symbol.for('lifecycle.loadable.construct');

// A *resource* (or "Loadable") is an object that has both an item and a status.
export type Loadable<T> = {
    [itemKey] : undefined | T, // May be `undefined`, if not ready
    [statusKey] : Status,
    
    // Construct a new resource from this one, using the given item and status
    [constructKey] : (item : undefined | T, status : Status) => Loadable<T>,
};


/*
LoadableSimple: simple resource implementation that just stores the item and status in a plain object. Also
exposes these as regular (non-symbol) properties (so you can access them simply as `res.item` and `res.status`).
*/
export type LoadableSimpleT<T> = Loadable<T> & { item : undefined | T, status : Status };
export const LoadableSimple = <T>(item : undefined | T, status : Partial<Status> = {}) : LoadableSimpleT<T> => {
    // If the status is ready, then `item` cannot be `undefined`
    if (status.ready === true && typeof item === 'undefined') {
        throw new TypeError('Expected an item, but given `undefined`');
    }
    
    // If the status is not ready, then `item` must be `undefined`
    //if (status.ready === false && typeof item !== 'undefined') {
    //    throw new TypeError($msg`Expected \`undefined\`, but given ${item}`);
    //}
    
    const statusWithDefaults = { ...defaultStatus, ...status };
    
    const loadable : LoadableSimpleT<T> = {
        [itemKey]: item,
        [statusKey]: statusWithDefaults,
        [constructKey]: LoadableSimple,
        
        // Also expose as regular (non-symbol) keys
        item,
        status: statusWithDefaults,
    };
    
    return loadable;
};


/*
LoadableProxy: resource implementation that uses a Proxy, in order to expose an interface that appears the same
as the item itself (status is "hidden" using a symbol key).
*/
type LoadableProxyT<T extends Proxyable> = Loadable<T> & ProxyableExternal<T>;
export const LoadableProxy = <T extends Proxyable>(item : undefined | T, status : Partial<Status> = {})
    : LoadableProxyT<T> => {
        // If the status is ready, then `item` cannot be `undefined`
        if (status.ready === true && typeof item === 'undefined') {
            throw new TypeError('Expected an item, but given `undefined`');
        }
        
        // If the status is not ready, then `item` must be `undefined`
        //if (status.ready === false && typeof item !== 'undefined') {
        //    throw new TypeError($msg`Expected \`undefined\`, but given ${item}`);
        //}
        
        const statusWithDefaults = { ...defaultStatus, ...status }; // TODO: default ready value
        
        // Prevent proxying multiple times (to prevent bugs where an object is repeatedly proxied over and over)
        if (extend.is(item)) {
            throw new TypeError($msg`Cannot create a LoadableProxy from an item which is already a LoadableProxy`);
            
            // TODO: maybe just unwrap the given proxy and override the status?
            //const { extension: { [itemKey]: _item, [statusKey]: _status } } = extend.unwrap(item);
        }
        
        const itemProxyable = typeof item === 'undefined' ? null : item;
        
        if (!isProxyable(itemProxyable)) {
            throw new TypeError(`Cannot proxy the given value: ${itemProxyable}`);
        }
        
        return extend(itemProxyable, {
            [itemKey]: item,
            [statusKey]: statusWithDefaults,
            [constructKey]: LoadableProxy,
        }) as LoadableProxyT<T>;
    };


// Updater methods

export const update = <T>(resource : Loadable<T>, item : undefined | T, status : Status) =>
    resource[constructKey](item, status);
export const updateItem = <T>(resource : Loadable<T>, item : undefined | T) =>
    resource[constructKey](item, resource[statusKey]);
export const updateStatus = <T>(resource : Loadable<T>, status : Status) =>
    resource[constructKey](resource[itemKey], status);

export const asPending = <T>(resource : Loadable<T>) =>
    resource[constructKey](undefined, { ready: false, loading: false, error: null });
export const asLoading = <T>(resource : Loadable<T>) =>
    resource[constructKey](
        resource[itemKey],
        { ...resource[statusKey], loading: true } // TODO: should we also clear any error here?
    );
export const asReady = <T>(resource : Loadable<T>, item ?: T) =>
    resource[constructKey](
        typeof item === 'undefined' ? resource[itemKey] : item, // `item` is optional, if not present use existing
        { ready: true, loading: false, error: null }
    );
export const asFailed = <T>(resource : Loadable<T>, reason : Error) =>
    resource[constructKey](
        resource[itemKey],
        { ...resource[statusKey], error: reason }
    );
