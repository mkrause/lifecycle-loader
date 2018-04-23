
import $msg from 'message-tag';


/*
Loadable: wrapper around arbitrary values (using a Proxy) for asynchronously loaded data. The
wrapper adds a `status` property that keeps track of the loading state.

Status flags:
  - ready: indicates whether this item can be used or not (whether the data can be read safely)
  - loading: indicates whether we are currently in the process of loading this item
  - error: indicates that loading is done and it resulted in an error

Note that each of the flags is independent, rather than being a linear transition. This is so that
we can (for example) start loading new data while keeping information such as an error state, for
UI purposes.

- !ready + !loading + !error     "pending", nothing done yet, not even attempted to load
- !ready +  loading + !error     "loading", for the first time, no older data available
-  ready + !loading + !error     "idle", can use the data as needed
-  ready +  loading + !error     "reloading", but there is data available in the meantime
- !ready + !loading +  error     failed, and not yet any attempt to retry (no older data available)
- !ready +  loading +  error     failed, but we're currently retrying (no older data available)
-  ready + !loading +  error     failed, and not yet any attempt to retry (there is older data available)
-  ready +  loading +  error     failed, but we're currently retrying (there is older data available)

Example:
    const user = Loadable({ name: null });
    user[status]; // ready = false, loading = false, error = false
    
    const userLoading = user[status].withLoading();
    userLoading[status]; // ready = false, loading = true, error = false
    
    const userLoaded = userLoading[status].withReady({ name: "John" });
    userLoaded[status]; // ready = true, loading = false, error = false
*/

const statusKey = Symbol('status');
const originalKey = Symbol('original');

const statusMethods = {
    update(updatedStatus) {
        return Loadable(this[originalKey], { ...this[statusKey], ...updatedStatus });
    },
    invalidated: () => {
        return Loadable(this[originalKey], { ready: false, loading: false, error: null });
    },
    asReady: valueReady => {
        return Loadable(valueReady, { ready: true, loading: false, error: null });
    },
    withLoading: (loading = true) => {
        return Loadable(this[originalKey], { ...this[statusKey], loading: true });
    },
    withError: error => {
        return Loadable(this[originalKey], { ...this[statusKey], loading: false, error });
    },
};

const handlerMethods = {
    // Note: within all of the following, we can assume that `target` is a non-primitive object.
    
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

const Loadable = (value, { ready = false, loading = false, error = null } = {}) => {
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
    }
    
    // Note: use `statusMethods` as prototype, rather than adding it directly to the status object,
    // so that the methods are not copied when enumerating.
    const status = Object.assign(Object.create(statusMethods), { ready, loading, error });
    
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

export { statusKey as status };
export default Loadable;
