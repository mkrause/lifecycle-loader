
/*
Loadable: wrapper around arbitrary values (using a Proxy) for asynchronously loaded data. The
wrapper adds a `status` property that keeps track of the loading state.

Status flags:
  - ready: indicates whether this item can be used or not (whether the data can be read safely)
  - loading: indicates whether we are currently working to load this item
  - error: indicates that loading is done and it resulted in an error

Note that each of the flags is independent, rather than being a linear transition. This is so
that we can (for example) start loading new data while keeping information such as an error state,
for UI purposes.

- !ready + !loading + !error     "pending", nothing done yet, not even attempted to load
- !ready +  loading + !error     "loading", for the first time, no older data to show
-  ready + !loading + !error     "idle", can use the data as needed
-  ready +  loading + !error     "reloading", but there is data to be shown in the mean time
- !ready + !loading +  error     failed, and not yet any attempt to retry (no older data to show)
- !ready +  loading +  error     failed, but we're currently retrying (no older data to show)
-  ready + !loading +  error     failed, and not yet any attempt to retry (there is older data to show)
-  ready +  loading +  error     failed, but we're currently retrying (there is older data to show)

Example:
    const user = Loadable({ name: null });
    user.status; // ready = false, loading = false, error = false
    
    const userLoading = user.status.withLoading();
    userLoading.status; // ready = false, loading = true, error = false
    
    const userLoaded = userLoading.status.withReady({ name: "John" });
    userLoaded.status; // ready = true, loading = false, error = false
*/


const statusKey = Symbol('status');

// Note: some methods (internal slots) need special treatment when proxying
// https://stackoverflow.com/questions/36394479
const slotMethods = ['valueOf', 'toString', Symbol.toPrimitive];

const Loadable = (value, { ready = false, loading = false, error = null } = {}) => {
    const status = { ready, loading, error };
    Object.assign(status, {
        update: updatedStatus => Loadable(value, { ...status, ...updatedStatus }),
        invalidated: () => Loadable(value, { ready: false, loading: false, error: null }),
        withReady: valueReady => Loadable(valueReady, { ready: true, loading: false, error: null }),
        withLoading: (loading = true) => Loadable(value, { ...status, loading: true }),
        withError: error => Loadable(valueReady, { ...status, loading: false, error }),
    });
    
    let target = value;
    
    // We need to box primitives so we can proxy them
    if (typeof value === 'string') {
        target = new String(value);
    } else if (typeof value === 'number') {
        target = new Number(value);
    }
    
    // Note: the proxy methods have to be created again for each proxy, because we rely on a
    // closure to store the `status` of each proxy.
    return new Proxy(target, {
        has(target, name) {
            if (name === statusKey) {
                return true;
            }
            
            // Implement `toJSON` for boxed primitives
            if (name === 'toJSON') {
                if (target instanceof String || target instanceof Number) {
                    return true;
                } else {
                    return 'toJSON' in target;
                }
            }
            
            return target.hasOwnProperty(name);
        },
        get(target, name) {
            if (name === statusKey) {
                return status;
            }
            
            // Implement `toJSON` for boxed primitives
            if (name === 'toJSON') {
                if (target instanceof String) {
                    return () => target.toString();
                } else if (target instanceof Number) {
                    return () => target.valueOf();
                } else {
                    return target.toJSON;
                }
            }
            
            if (name in slotMethods && name in target && target[name] instanceof Function) {
                return target[name].bind(target);
            } else {
                return target[name];
            }
        },
    });
};

export const status = statusKey;
export default Loadable;
