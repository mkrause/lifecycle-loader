
import $msg from 'message-tag';


/*
Similar:
  - https://www.npmjs.com/package/proxy-helpers
*/

const hasOwnProperty = (obj, propName) => Object.prototype.hasOwnProperty.call(obj, propName);

type Extension = { [key in keyof any] : unknown };
const isProxyKey = Symbol();

const handlerMethods = {
    // Note: within all of the following, we can assume that `target` is a non-primitive object,
    // guaranteed by the fact that in JS a Proxy target must be a non-primitive object.
    
    ownKeys(target) {
        // Note: `ownKeys` should include non-enumerable keys
        return [...Reflect.ownKeys(extension), ...Reflect.ownKeys(target)];
    },
    has(target, name) {
        if (hasOwnProperty(extension, name)) {
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
            // target. Because they explicitly check the type of `this` (e.g. `Date`), or because they need
            // to access an original slot of the target (e.g. `String.toString`).
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
        return Object.getOwnPropertyDescriptor(target, name);
    },
};

const ProxyWrapper = <V, E extends Extension>(value : V, extension : E) => {
    if (typeof value === 'object' && value !== null && value[isProxyKey] === true) {
        return value; // Already proxied
    }
    
    // The target object. Note that Proxy only accepts an object (non-null), i.e. no primitive
    // types (undefined, null, string, number, boolean, symbol).
    let target = value;
    
    // Handle some primitives (values that cannot be proxied)
    if (typeof target === 'undefined') {
        throw new TypeError($msg`Cannot construct Proxy, given \`undefined\``);
    } else if (target === null) {
        // Interpret null values as "empty", simulate by using an empty object
        target = {};
    } else if (typeof value === 'string') {
        target = new String(value);
    } else if (typeof value === 'number') {
        target = new Number(value);
    } else if (typeof value === 'boolean') {
        throw new TypeError($msg`Cannot construct Proxy from boolean, given ${value}`);
    } else if (typeof value === 'symbol') {
        throw new TypeError($msg`Cannot construct Proxy from symbol, given ${value}`);
    } else if (typeof value !== 'object') {
        // Note: this should never happen, unless JS adds a new type of primitive
        throw new TypeError($msg`Cannot construct Proxy, given value of unknown type: ${value}`);
    }
    
    // Note: use `statusMethods` as prototype, rather than adding it directly to the status object,
    // so that the methods are not copied when enumerating (e.g. by object spread).
    // const status : Status = Object.assign(Object.create(statusMethods), { ready, loading, error });
    
    // Remember the original value
    // Object.defineProperty(status, itemKey, {
    //     value,
    //     enumerable: false,
    // });
    
    // Note: some proxy methods (the ones that reference `status`) have to be created inline for each proxy,
    // because we rely on a closure to store the `status` of each proxy.
    return new Proxy(target, {
        ...handlerMethods,
        get(target, name, receiver) {
            if (hasOwnProperty(extension, name)) {
                return extension[name];
            }
            
            return handlerMethods.get(target, name, receiver);
        },
        getOwnPropertyDescriptor(target, name) {
            if (hasOwnProperty(extension, name)) {
                return {
                    value: extension[name],
                    
                    // Make the status non-enumerable, so it does not get copied (e.g. on `{ ...obj }` spread)
                    enumerable: false,
                    
                    // *Must* be configurable, see:
                    // https://stackoverflow.com/questions/40921884
                    configurable: true,
                };
            }
        },
    });
};

export default ProxyWrapper;
