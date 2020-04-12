
# lifecycle-loader

Utilities for working with asynchronously loaded state.


## Motivation

<details>
    <summary><b>Click to show</b></summary>
    <p>
When loading data asynchronously in JavaScript, you will use some kind of control flow. Using async/await, it might look something like this:

```js
async function loadUser(userId) {
    // Here, we are in a "LOADING" state
    
    try {
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


## Usage

Use `Loadable` to annotate an object with a status:

```js
import { Loadable } from '@mkrause/lifecycle-loader';

// Get a user from some API
const userId = 42;
const user = await api.fetchUser(userId);
user; // { id: 42, name: 'John' }

// Turn the user into a "loadable" resource (annotate with a status object)
const userResource = Loadable(user);

// Resource retains its original properties
userResource.name; // 'John'

// But now also has an associated status
Loadable.getStatus(userResource); // { ready: true, loading: false, error: null }
```

We can use `Loadable` to create a *resource loader*, which automatically annotates the result with the appropriate status:

```js
import { Loadable } from '@mkrause/lifecycle-loader';

async function fetchUser(userId) {
    const userResource = Loadable.asLoading(Loadable());
    
    try {
        const user = await api.fetchUser(userId);
        return Loadable.asReady(userResource, user);
    } catch (reason) {
        return Loadable.asFailed(userResource, reason);
    }
}

// Fetching an existing user
const user1 = await fetchUser(42);
Loadable.getStatus(user1); // { ready: true, loading: false, error: null }

// Fetching a nonexistant user
const user2 = await fetchUser(999);
Loadable.getStatus(user2); // { ready: false, loading: false, error: <Error> }
```

Alternatively, create a resource loader directly from a Promise:

```js
import { Loadable, Loader } from '@mkrause/lifecycle-loader';


async function fetchUser(userId) {
    return await Loader.fromPromise(api.fetchUser(userId));
}
```


## Reference

### Status

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
* `error`: Whether there has been an error. Either `null` (no error), or some JavaScript `Error` instance.

Note that any combination of these three properties is a valid status. For example, consider `ready: true` and `loading: true`. That means the we already have a valid item (that can be shown in the UI for instance), but we are also loading the item to get a newer version. In other words we're doing a reload. A complete list of possible combinations and their interpretations can be found [here](https://github.com/mkrause/lifecycle-loader/blob/master/src/interfaces/Loadable.js).


### Loadable

**Loadable()**

```ts
Loadable : <T>(item : T) => T & {
    [Loadable.item] : T,
    [Loadable.status] : Status,
};
```

`Loadable` creates takes some item and turns it into a *resource*. A resource has an interface similar to the original value, but also includes a *status*. The status can be accessed through the special `Loadable.status` symbol, or through the `Loadable.getStatus` utility method.
