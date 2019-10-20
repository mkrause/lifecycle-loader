
import $msg from 'message-tag';

import { statusKey, Status } from '../interfaces/Status.js';
import { itemKey, Loadable, StatusMethods } from '../interfaces/Loadable.js';

import ProxyExtend, { proxyKey } from 'proxy-extend';


const statusMethods = {
    asReady<T>(item : T) : Loadable<T> {
        // TODO
        return undefined as any;
    },
    asFailed<T>(reason : Error) : Loadable<T> {
        // TODO
        return undefined as any;
    },
    asLoading<T>() : Loadable<T> {
        // TODO
        return undefined as any;
    },
};

const defaultStatus : Status = { ready: false, loading: false, error: null };

type Proxyable = null | string | number | object;
const LoadableProxy = <T extends Proxyable>(item : null | T, status : Partial<Status> = {}) : Loadable<T> => {
    const statusWithDefaults = { ...defaultStatus, ...status };
    
    // Prevent proxying multiple times (to prevent bugs where an object is repeatedly proxied over and over)
    if (typeof item === 'object' && item !== null && proxyKey in item) {
        // TODO: maybe just unwrap the given proxy and override the status?
        throw new TypeError($msg`Cannot create a LoadableProxy from an item which is already a LoadableProxy`);
    }
    
    // Note: use `statusMethods` as prototype, rather than adding it directly to the status object,
    // so that the methods are not copied when enumerating (e.g. by object spread).
    const statusWithMethods : Status & StatusMethods<T> = Object.assign(
        Object.create(statusMethods),
        statusWithDefaults
    );
    
    return ProxyExtend(item, { [statusKey]: statusWithMethods, [itemKey]: item });
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
