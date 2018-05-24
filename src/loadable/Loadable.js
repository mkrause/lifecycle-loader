// @flow

import $msg from 'message-tag';

import statusKey from '../status.js';
import type { Status } from '../status.js';


/*
Loadable: wrapper around arbitrary values (using a Proxy) for asynchronously loaded data. The
wrapper adds a `status` property that keeps track of the loading state.

Example:
    const user = Loadable({ name: null });
    user[status]; // ready = false, loading = false, error = false
    
    const userLoading = user[status].asLoading();
    userLoading[status]; // ready = false, loading = true, error = false
    
    const userLoaded = userLoading[status].asReady({ name: "John" });
    userLoaded[status]; // ready = true, loading = false, error = false
*/

type LoadableI = {
    [statusKey] : Status,
};

const originalKey = Symbol('original');

const statusMethods = {
    update(updatedStatus) {
        return Loadable(this[originalKey], { ...this[statusKey], ...updatedStatus });
    },
    invalidated() {
        return Loadable(this[originalKey], { ready: false, loading: false, error: null });
    },
    asReady(valueReady) {
        return Loadable(valueReady, { ready: true, loading: false, error: null });
    },
    asLoading(loading = true) {
        return Loadable(this[originalKey], { ...this[statusKey], loading: true });
    },
    asFailed(reason) {
        return Loadable(this[originalKey], { ...this[statusKey], loading: false, error: reason });
    },
};

const handlerMethods = {
    // Note: within all of the following, we can assume that `target` is a non-primitive object,
    // guaranteed by the fact that Proxy targets can only be non-primitive objects.
    
    ownKeys(target) {
        // Note: `ownKeys` should include non-enumerable keys
        return [statusKey, ...Reflect.ownKeys(target)];
    },
    has(target, name) {
        if (name === statusKey) {
            return true;
        }
        
        // Implement `toJSON` for boxed primitives
        if (name === 'toJSON') {
            if (target instanceof String || target instanceof Number) {
                return true;
            }
        }
        
        return name in target;
    },
    get(target, name, receiver) {
        // Implement `toJSON` for boxed primitives
        if (name === 'toJSON') {
            if (target instanceof String) {
                return target.toString.bind(target);
            } else if (target instanceof Number) {
                return target.valueOf.bind(target);
            }
        }
        
        if (!(name in target)) {
            return undefined;
        }
        
        const targetProp = target[name];
        
        if (typeof targetProp === 'function') {
            // Some methods of built-in types cannot be proxied, i.e. they need to bound directly to the
            // target. Because they explicitly check the type of `this` (e.g. Date), or because they need
            // to access an original slot of the target (e.g. String.toString).
            // https://stackoverflow.com/questions/36394479
            // https://stackoverflow.com/questions/47874488/proxy-on-a-date-object
            const cannotProxy =
                target instanceof String
                || target instanceof Number
                || target instanceof Date
                || target instanceof RegExp;
            
            if (cannotProxy) {
                // Have `this` bound to the original target
                return targetProp.bind(target);
            } else {
                // Unbound (i.e. `this` will be bound to the proxy object, or possibly some other receiver)
                return targetProp;
            }
        } else {
            return targetProp;
        }
    },
    getOwnPropertyDescriptor(target, name) {
        if (name === statusKey) {
            return {
                value: this[statusKey],
                
                // Make the status non-enumerable, so it does not get copied (e.g. on `{ ...obj }` spread)
                enumerable: false,
                
                // *Must* be configurable, see:
                // https://stackoverflow.com/questions/40921884
                configurable: true,
            };
        }
        return Object.getOwnPropertyDescriptor(target, name);
    },
};

const Loadable = (value : mixed, { ready = false, loading = false, error = null } : Status = {}) => {
    if (typeof value === 'object' && value && statusKey in value) {
        return value; // Already a Loadable
    }
    
    // The target object. Note that a proxy target must be an object (non-null), i.e. no primitive
    // types (undefined, null, string, number, boolean, symbol).
    let target = value;
    
    // Handle primitives (values that cannot be proxied)
    if (target === undefined) {
        throw new TypeError($msg`Cannot construct Loadable, given \`undefined\``);
    } if (target === null) {
        // Interpret null values as "empty", simulate by using an empty object
        target = {};
    } if (typeof value === 'string') {
        target = new String(value);
    } else if (typeof value === 'number') {
        target = new Number(value);
    } else if (typeof value === 'boolean') {
        throw new TypeError($msg`Cannot construct Loadable from boolean, given ${value}`);
    } else if (typeof value === 'symbol') {
        throw new TypeError($msg`Cannot construct Loadable from symbol, given ${value}`);
    } else if (typeof value !== 'object') {
        throw new TypeError($msg`Cannot construct Loadable, given value of unknown type: ${value}`);
    }
    
    // Note: use `statusMethods` as prototype, rather than adding it directly to the status object,
    // so that the methods are not copied when enumerating.
    const status : Status = Object.assign(Object.create(statusMethods), { ready, loading, error });
    
    // Remember the original value
    Object.defineProperty(status, originalKey, {
        value,
        enumerable: false,
    });
    
    // Note: the proxy methods (or at least the ones that reference `status`) have to be created again
    // for each proxy, because we rely on a closure to store the `status` of each proxy.
    return new Proxy(target, {
        ...handlerMethods,
        get(target, name, receiver) {
            if (name === statusKey) {
                return status;
            }
            
            return handlerMethods.get(target, name, receiver);
        },
    });
};

export default Loadable;
