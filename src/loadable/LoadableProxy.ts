
import $msg from 'message-tag';

import { statusKey, Status } from '../interfaces/status.js';
import { itemKey, Loadable } from '../interfaces/loadable.js';

import ProxyWrapper, { isProxyKey } from '../util/ProxyWrapper.js';


const defaultStatus : Status = { ready: false, loading: false, error: null };

const LoadableProxy = (value : unknown, status : Status = defaultStatus) => {
    // Prevent proxying multiple times (to prevent bugs where an object is repeatedly proxied over and over)
    if (typeof value === 'object' && value !== null && isProxyKey in value) {
        // TODO: maybe just unwrap the given proxy and override the status?
        throw new TypeError($msg`Cannot create a LoadableProxy from a value which is already a LoadableProxy`);
    }
    
    /*
    // Note: use `statusMethods` as prototype, rather than adding it directly to the status object,
    // so that the methods are not copied when enumerating (e.g. by object spread).
    const status : Status = Object.assign(Object.create(statusMethods), { ready, loading, error });
    
    // Remember the original value
    Object.defineProperty(status, itemKey, {
        value,
        enumerable: false,
    });
    */
    
    return ProxyWrapper(value, { [statusKey]: status });
};

/*
LoadableProxy.fromPromise = async (promise, subscriber = () => {}) => {
    subscriber(LoadableProxy(null, { loading: true }));
    
    try {
        const result = await promise;
        
        let loadable;
        if (statusKey in result) {
            loadable = result;
        } else {
            loadable = LoadableProxy(result, { ready: true });
        }
        
        subscriber(loadable);
        return loadable;
    } catch (reason) {
        const loadable = LoadableProxy(null, { error: reason });
        
        subscriber(loadable);
        return loadable;
    }
};

LoadableProxy.fromPromiseWithCache = async (item, promise, subscriber = () => {}) => {
    // We can only work with items that have been constructed using `LoadablyProxy`, otherwise
    // we don't have a standard way to access the underlying item.
    if (!(itemKey in item)) {
        throw new TypeError($msg`Expected LoadableProxy, given ${item}`);
    }
    
    subscriber(LoadableProxy(null, { loading: true }));
    
    try {
        const result = await promise;
        
        let loadable;
        if (statusKey in result) {
            loadable = result;
        } else {
            loadable = LoadableProxy(result, { ready: true });
        }
        
        subscriber(loadable);
        return loadable;
    } catch (reason) {
        const loadable = LoadableProxy(null, { error: reason });
        
        subscriber(loadable);
        return loadable;
    }
};
*/

export default LoadableProxy;
