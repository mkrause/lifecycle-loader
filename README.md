
# lifecycle-loader

[![npm](https://img.shields.io/npm/v/@mkrause/lifecycle-loader.svg)](https://www.npmjs.com/package/@mkrause/lifecycle-loader)
[![GitHub Actions](https://github.com/mkrause/lifecycle-loader/actions/workflows/nodejs.yml/badge.svg)](https://github.com/mkrause/lifecycle-loader/actions)
[![MIT](https://img.shields.io/npm/l/@mkrause/lifecycle-loader)](https://github.com/mkrause/lifecycle-loader)
[![Types](https://img.shields.io/npm/types/@mkrause/lifecycle-loader)](https://github.com/mkrause/lifecycle-loader)

Utilities for working with asynchronously loaded state. This library is intended to be used as a primitive within a higher-level API library, see for example: [lifecycle-rest](https://github.com/mkrause/lifecycle-rest).


## Motivation

<details>
    <summary><b>Click to show</b></summary>
    <p>
When fetching data asynchronously in JavaScript, you will write some kind of control flow. Using async/await, it might look something like this:

```js
const loadUser = async userId => {
    try {
        // Between the following call and when the promise is resolved, we are in a "LOADING" state
        const user = await api.fetchUser(userId);
        
        // Here, we are in a "READY" state
        return user;
    } catch (reason) {
        // Here, we are in a "FAILED" state
        throw reason;
    }
};
```

When rendering a UI, we don't just care about the *result* of this function, we also care about the intermediate states. For example, when we start loading the user we may want to show a loading indicator.

Additionally, we will often want to keep information about previous loading attempts. For example, after rendering the user info once succesfully, we may want to reload it at some point. While the new data is loaded, we want to keep the old user data to show on the screen (with a loading indicator). If there are any error messages, we may want to remember those as well in order to be able to show them even after a reload attempt.

To handle such use cases we will need to "reify" the control flow somehow. For example, in state management libraries like redux we may keep a *status* flag next to the data that keeps track of the state of the loading process:

```js
// Example: using redux + redux-thunk
const loadUserAction = userId => async dispatch => {
    dispatch({ type: 'LOAD_USER', status: 'LOADING' });
    
    try {
        const user = await api.fetchUser(userId);
        
        dispatch({ type: 'LOAD_USER', status: 'READY', user });
    } catch (reason) {
        dispatch({ type: 'LOAD_USER', status: 'FAILED', reason });
    }
};

// Dispatch the thunk to the redux store
dispatch(loadUserAction(42));
```

This example uses redux with redux-thunk, but the exact choice of state management library/async middleware doesn't matter. The point is that we need to take a control flow, and turn it into a series of UI states (JavaScript values) that we can feed into the UI to tell it to render each successive state of the UI.

This library intends to simplify handling of async state by providing a standard set of interfaces and tools.
    </p>
</details>


## Usage

`Loadable` takes some data (or "item") and annotates it with a *status*:

```js
import { Loadable } from '@mkrause/lifecycle-loader';

// Some "item"
const user = { id: 42, name: 'John' };

// Create a Loadable "resource" from the given item
const userResource = Loadable(user);

// The resource has the same interface as the original item (its properties are maintained)
console.log(userResource.name); // 'John'

// ...but now it also has an associated status (through the `Loadable.status` symbol)
const userStatus = userResource[Loadable.status]; // { ready: true, loading: false, error: null }
```

The *status* consists of the following flags:

* `ready: boolean` Indicates whether there is an item present (i.e. whether there is data we can use).
* `loading: boolean` Indicates whether this resource is currently being (re)loaded.
* `error: null | Error` Contains the error for the most recent load attempt, or `null` if no error.

Each of these three flags are independent of each other. For example, a resource may be `ready` and yet have an `error` associated with it. In that case, the UI is able to read the item data to show on the screen, and also show the error to the user to indicate the newest data could not be fetched.

<details>
    <summary><b>Summary of different status flag combinations and their interpretations</b></summary>
    <table>
        <thead>
            <tr>
                <th>Flags</th>
                <th>State</th>
                <th>Meaning</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>!ready && !loading && !error</code></td>
                <td>"pending"</td>
                <td>Nothing done yet, not even attempted to load</td>
            </tr>
            <tr>
                <td><code>!ready && loading && !error</code></td>
                <td>"loading"</td>
                <td>In the process of loading item, no current (cached) item available</td>
            </tr>
            <tr>
                <td><code>ready && !loading && !error</code></td>
                <td>"ready"</td>
                <td>Item is ready to be used, no loading or error</td>
            </tr>
            <tr>
                <td><code>ready && loading && !error</code></td>
                <td>"reloading"</td>
                <td>Item is ready, but we are also reloading a new version</td>
            </tr>
            <tr>
                <td><code>!ready && !loading && error</code></td>
                <td>"failed (pending)"</td>
                <td>Loading has failed, no cached item and no reload attempt</td>
            </tr>
            <tr>
                <td><code>!ready && loading && error</code></td>
                <td>"failed (loading)"</td>
                <td>Loading has failed, no cached item, currently trying again</td>
            </tr>
            <tr>
                <td><code>ready && !loading && error</code></td>
                <td>"failed (ready)"</td>
                <td>Loading has failed, cached item available, no reload attempt</td>
            </tr>
            <tr>
                <td><code>ready && loading && error</code></td>
                <td>"failed (reloading)"</td>
                <td>Loading has failed, cached item available, currently trying again</td>
            </tr>
        </tbody>
    </table>
</details>

The `Loadable.status` property is nonenumerable. If you try to copy a resource (e.g. using a spread operator, `{ ...resource }`), the status will be lost. To perform an immutable update on a resource, you can use `Loadable.update`:

```js
// Create a copy of `userResource` with an updated `name` and the `loading` status flag set to true
const userUpdated = Loadable.update(userResource, { ...userResource, name: 'Bob' }, { loading: true });

// Or use a shorthand:
Loadable.asPending(resource); // Clear data and reset status to "pending"
Loadable.asLoading(resource); // Set status to "loading"
Loadable.asReady(resource, item); // Set status to "ready"
Loadable.asFailed(resource, reason); // Set status to "failed"
```


## Resource loaders

This library is intended to be used as a low-level primitive for an API service. We will refer to a function that performs an API call and returns a Loadable as a *resource loader*.

**With async/await**

We can write a resource loader using async/await as follows:

```js
import { Loadable } from '@mkrause/lifecycle-loader';
import api from './my_api.js';

const fetchUser = async userId => {
    const userResource = Loadable.asLoading(Loadable());
    
    try {
        const user = await api.fetchUser(userId);
        return Loadable.asReady(userResource, user);
    } catch (reason) {
        return Loadable.asFailed(userResource, reason);
    }
};

// Fetching an existing user
const user1 = await fetchUser(42);
user1[Loadable.status]; // { ready: true, loading: false, error: null }

// Fetching a nonexistent user
const user2 = await fetchUser(999);
user2[Loadable.status]; // { ready: false, loading: false, error: <Error> }
```

The downside is that, since `await` stops execution until the promise is resolved, the function has no discernible "loading" state. Even if we don't await the `fetchUser` call, we just get a Promise, not a Loadable resource.

```js
const userPromise = fetchUser(42);
// `userPromise` is just a Promise, cannot retrieve a resource from it
```

What we'd like is to be able to return a user resource in "loading" state from the `fetchUser` call.

**With `Loader.fromPromise`**

```js
import { Loadable, Loader } from '@mkrause/lifecycle-loader';
import api from './my_api.js';

// Same as above, but returns a Promise with `Loader.resource` property
const fetchUser = userId => {
    return Loader.fromPromise(api.fetchUser(userId));
};

const userPromise = fetchUser(42);
const userLoading = userPromise[Loader.resource];
console.log(userLoading[Loadable.status]); // { ready: false, loading: true, error: null }

try {
    const userReady = await userPromise;
    console.log(userReady[Loadable.status]); // { ready: true, loading: false, error: null }
} catch (error) {
    // `error` is of type `LoadError`, and has an associated resource
    const userFailed = error[Loader.resource];
    console.log(userFailed[Loadable.status]); // { ready: false, loading: false, error: <reason> }
}
```


## Reference

### Status

```typescript
type Status = {
    ready: boolean,
    loading: boolean,
    error: null | Error,
};
```

A *status* is an object that describes the current loading state of some item. It has the following properties:

* `ready`: Tells you whether the item can be safely used in the application. That is, whether the item is a valid value of the type expected by the application.
* `loading`: Whether or not we are currently in the process of loading (or reloading) the item.
* `error`: Whether there has been an error. Either `null` (no error), or some JavaScript `Error` instance.

Note that any combination of these three properties is a valid status. For example, consider `ready: true` and `loading: true`. That means the we already have a valid item (that can be shown in the UI for instance), but we are also loading the item to get a newer version. In other words we're doing a reload. A complete list of possible combinations and their interpretations can be found [here](https://github.com/mkrause/lifecycle-loader/blob/master/src/interfaces/Loadable.js).


### Loadable

**Loadable()**

```typescript
Loadable: <T>(item: T) => T & {
    [Loadable.item]: T,
    [Loadable.status]: Status,
};
```

`Loadable` creates takes some item and turns it into a *resource*. A resource has an interface similar to the original value, but also includes a *status*. The status can be accessed through the special `Loadable.status` symbol, or through the `Loadable.getStatus` utility method.
