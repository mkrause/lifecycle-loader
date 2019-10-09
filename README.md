
# lifecycle-loader

Utilities for working with asynchronously loaded state.


## Motivation

When loading data asynchronously in JavaScript, you will use some kind of control flow. Using async/await, it might look something like this:

```js
async function loadUser(userId) {
    try {
        // Here, we are in a "LOADING" state
        
        const user = await api.fetchUser(userId);
        
        // Here, we are in a "READY" state
        return user;
    } catch (reason) {
        // Here, we are in a "FAILED" state
        throw reason;
    }
}
```

When rendering a UI, we don't just care about the result of this function, we also care about the intermediate states. For example, when we start loading the user we may want to show a loading indicator.

Additionally, we will often want to keep information about previous loading attempts. For example, after rendering the user info once succesfully, we may want to reload it at some point. While the new data is loaded, we want to keep the old user data to show on the screen (with a loading indicator). If there are any error messages, we may want to remember those as well in order to be able to show them even after a reload attempt.

To handle such use cases we will need to "reify" the control flow somehow. For example, in state management libraries like redux we may keep a *status* flag next to the data that keeps track of the state of the loading process:

```js
// Example: using redux + redux-thunk
function loadUserAction(dispatch) {
    return async userId => {
        dispatch({ type: 'LOAD_USER', status: 'LOADING' });
        
        try {
            const user = await api.fetchUser(userId);
            
            dispatch({ type: 'LOAD_USER', status: 'READY', user });
        } catch (reason) {
            dispatch({ type: 'LOAD_USER', status: 'FAILED', reason });
        }
    };
}
```

This example uses redux with something like redux-thunk, but the exact choice of state management library/async middleware doesn't matter. The point is that we need to take a control flow, and turn it into a series of UI states (JavaScript values) that we can feed into the UI to tell it to render each successive state of the UI.

This library intends to simplify handling of async state by providing a standard set of interfaces and tools.
    </p>
</details>


## Usage example

```js
import { status, Loadable, loadablePromise } from '@mkrause/lifecycle-loader';
import api from './myApi.js';

// Creating a loader
const loadUser = userId => loadablePromise(api.fetchUser(userId));

// We can still use `await` as usual:
try {
    const user = await loadUser(42);
} catch (reason) {
    console.error(reason);
}

// Or, we can subscribe to the result to get a 
loadUser(42)
    .subscribe(user => {
        dispatch({ type: 'LOAD_USER', user });
        
        console.log(user[status]);
    });

// Logs:
// - `{ ready: false, loading: true, error: null }`
// - `{ ready: true, loading: false, error: null }`
```


## Reference

**Status**

```js
type Status = {
    ready : boolean,
    loading : boolean,
    error : ?Error,
};
```

A *status* is an object that describes the current loading state of some item. It has the following properties:

* `ready`: Tells you whether the item can be safely used in the application. That is, whether the item is a valid value of the type expected by the application.
* `loading`: Whether or not we are currently in the process of loading (or reloading) the item.
* `error`: Whether there has been an error. Either `null` (no error), or some JS `Error` instance.

Note that any combination of these three properties is a valid status. For example, consider `ready: true` and `loading: true`. That means the we already have a valid item (that can be shown in the UI for instance), but we are also loading the item to get a newer version. In other words we're doing a reload. A complete list of possible combinations and their interpretations can be found [here](https://github.com/mkrause/lifecycle-loader/blob/master/src/status.js).


**Loadable**

The status of an item may be stored separate from the item itself. Usually this is what applications do and it makes sense. However, it is often convenient to keep the status in the same place as the item. If your state is a large tree hierarchy, then it may be cumbersome to have to manage the item and the status separately.

For this reason we provide a wrapper interface for "loadable items" called `Loadable`. A `Loadable` instance is any JS object which defines the `status` key. `status` is a special JS symbol that you can import from this library.

```js
import { status } from '@mkrause/lifecycle-loader';

interface Loadable {
    [status] : Status;
};
```

You can either implement this property yourself (for types that you author), or you can use the `Loadable` proxy that's provided to transparently wrap around any existing JS object:


```js
import { status, Loadable } from '@mkrause/lifecycle-loader';

const loadableDate = Loadable(new Date('2018-01-01'));
loadableDate[status].ready; // false

// The object is proxied, so you can still use it as usual:
loadableDate.getFullYear(); // 2018
```


**Loader**

A *loader* is a function which returns a `Loadable` item, usually asynchronously. It's similar to any regular `async` function in JavaScript (and in fact can be used using `await`), except that it keeps track of the `status` while the load process runs.

```js
import { status, Loadable, loader } from '@mkrause/lifecycle-loader';

// Create a new loader (which in this case just returns a hardcoded result)
const loadUser = user => loader(user, resolve => resolve({ name: 'John' }));

(async () => {
    // Somewhere in our application
    const user = Loadable(null); // The item (currently empty)
    user[status].ready === false;
    
    const userLoaded = await loadUser(user);
    
    userLoaded.name === 'John';
    userLoaded[status].ready === true;
})();
```

Due to the blocking nature of `await`, the above does not give us the opportunity to handle a "loading" state. If we want to handle that as well, then we can just fall back to promises:

```js
const user = Loadable(null);
loadUser(user)
    .then(user => {
        user[status].ready === true;
    })
    .catch(error => {
        user[status].error instanceof Error;
    });

// Loading
user[status].loading === true;
```
