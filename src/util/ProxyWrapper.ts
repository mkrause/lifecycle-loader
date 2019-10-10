
import $msg from 'message-tag';


/*
Similar:
  - https://www.npmjs.com/package/proxy-helpers
*/

/*
Transparently wraps any value, with the exception of:

  - Equality will not work: `ProxyWrapper(42) !== 42`.
  - `typeof` will return `object` for strings/numbers (these are "boxed"): `typeof ProxyWrapper(42) -== 'object'`.
    (`instanceof` on the other hand will work fine.)
*/

// TODO: provide some utilities to customize debug formatting (`inspect` for Node, and a custom DevTools formatter).

const hasOwnProperty = (obj : object, propName : PropertyKey) =>
    Object.prototype.hasOwnProperty.call(obj, propName);

type Extension = { [key in PropertyKey] : unknown };
export const isProxyKey = Symbol('isProxy');

const handlerMethods = {
    // Note in the following that `this` will always be set to the handler object (by Proxy internally).
    
    getPrototypeOf<B, E extends Extension>({ body, extension } : { body : B, extension : E }) {
        if (typeof body === 'object' && body !== null) {
            return Object.getPrototypeOf(body);
        } else {
            return null;
        }
    },
    
    ownKeys<B, E extends Extension>({ body, extension } : { body : B, extension : E }) {
        // Note: `ownKeys` should include non-enumerable keys. Should also include symbol keys.
        
        // const extensionKeys = typeof extension === 'object' && extension !== null
        //     ? Reflect.ownKeys(extension as any)
        //     : [];
        
        const bodyKeys = typeof body === 'object' && body !== null
            ? Reflect.ownKeys(body as any)
            : [];
        
        // return [...extensionKeys, ...bodyKeys];
        return bodyKeys;
    },
    
    has<B, E extends Extension>({ body, extension } : { body : B, extension : E }, propName : PropertyKey) {
        if (hasOwnProperty(extension, propName)) { return true; }
        if (typeof body === 'object' && body !== null && propName in body) { return true; }
        
        // Implement `toJSON` for boxed primitives
        if (propName === 'toJSON') {
            if (body instanceof String || body instanceof Number) {
                return true;
            }
        }
        
        // Backdoor, to allow checking whether this is a proxy
        if (propName === isProxyKey) {
            return true;
        }
        
        return false;
    },
    
    get<B, E extends Extension>(
        { body, extension } : { body : B, extension : E },
        propName : PropertyKey,
        receiver : unknown
    ) {
        let targetProp = undefined;
        if (hasOwnProperty(extension, propName)) {
            targetProp = (extension as any)[propName]; // Cast to any (guaranteed by conditional)
        } else if (typeof body === 'object' && body !== null && propName in body) {
            targetProp = (body as any)[propName]; // Cast to any (guaranteed by conditional)
        } else {
            // Fallback: property is not present in either the body or extension
            
            // Implement `toJSON` for boxed primitives (as a convenience)
            if (propName === 'toJSON') {
                if (body instanceof String) {
                    targetProp = body.toString.bind(body);
                } else if (body instanceof Number) {
                    targetProp = body.valueOf.bind(body);
                }
            }
        }
        
        if (typeof targetProp === 'function') {
            // Some methods of built-in types cannot be proxied, i.e. they need to bound directly to the
            // target. Because they explicitly check the type of `this` (e.g. `Date`), or because they need
            // to access an original slot of the target (e.g. `String.toString`).
            // https://stackoverflow.com/questions/36394479
            // https://stackoverflow.com/questions/47874488/proxy-on-a-date-object
            const cannotProxy =
                body instanceof String
                || body instanceof Number
                || body instanceof Date
                || body instanceof RegExp;
            
            if (cannotProxy) {
                // Have `this` bound to the original target
                return targetProp.bind(body);
            } else {
                // Unbound (i.e. `this` will be bound to the proxy object, or possibly some other receiver)
                return targetProp;
            }
        } else {
            return targetProp;
        }
    },
    
    getOwnPropertyDescriptor<B, E extends Extension>(
        { body, extension } : { body : B, extension : E },
        propName : PropertyKey
    ) {
        if (hasOwnProperty(extension, propName)) {
            return {
                value: (extension as any)[propName],
                
                // Make the extension prop non-enumerable, so it does not get copied (e.g. on `{ ...obj }` spread)
                enumerable: false,
                
                // *Must* be configurable (enforced by Proxy), see:
                // https://stackoverflow.com/questions/40921884
                configurable: true,
            };
        } else {
            if (typeof body === 'object' && body !== null) {
                return Object.getOwnPropertyDescriptor(body, propName);
            } else {
                return undefined;
            }
        }
    },
    
    setPrototypeOf() { return false; },
    isExtensible() { return false; },
    //preventExtensions() {}, // Leave as default
    set() { throw new TypeError($msg`Unable to modify object`); },
    defineProperty() { throw new TypeError($msg`Unable to modify object`); },
    deleteProperty() { throw new TypeError($msg`Unable to modify object`); },
};

type Proxied<V, E> = E & (
    V extends undefined ? never
        : V extends null ? {}
        : V extends number ? Number
        : V extends boolean ? never
        : V extends symbol ? never
        : V
);

const ProxyWrapper = <V, E extends Extension>(value : V, extension : E = {} as E) => {
    let body : unknown = value;
    
    // Handle primitive values. Because a Proxy always behaves as an object, we cannot really transparently
    // "simulate" a primitive. However, we use sensible equivalents where possible.
    if (body === undefined) {
        throw new TypeError($msg`Cannot construct proxy, given \`undefined\``);
    } else if (body === null) {
        body = null;
    } else if (typeof value === 'string') {
        body = new String(value);
    } else if (typeof value === 'number') {
        body = new Number(value);
    } else if (typeof value === 'boolean') {
        // Note: we could use a boxed `Boolean`, but it would not be very useful because there's not much you can
        // do with it. For example, `!new Boolean(false)` is `false`, not `true`.
        throw new TypeError($msg`Cannot construct proxy from boolean, given ${value}`);
    } else if (typeof value === 'symbol') {
        throw new TypeError($msg`Cannot construct proxy from symbol, given ${value}`);
    } else if (typeof value !== 'object') {
        throw new TypeError($msg`Cannot construct proxy, given value of unknown type: ${value}`);
    }
    
    // Note: for `Proxy`, the following rule holds:
    // Any non-configurable property of the actual target must occur in the list of properties returned by `ownKeys`.
    // Thus, we want to prevent non-configurable properties existing on our target. That means that the target
    // cannot (for example) be an array, because then we would be required to implement properties like `length`.
    // https://stackoverflow.com/questions/39811021/typeerror-ownkeys-on-proxy-trap
    
    // Cast to `Proxied<V, E>`, to assert that the proxy behaves like `V`, but extended with `E`
    return new Proxy({ body, extension }, handlerMethods) as any as Proxied<V, E>;
};

export default ProxyWrapper;
