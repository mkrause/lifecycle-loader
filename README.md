
# lifecycle-loader

Utilities for working with asynchronously loaded state.


## Motivation

Oftentimes in applications you'll be dealing with state that is loaded asynchronously (e.g. over HTTP) while the application runs. This loading process has some bookkeeping that you need to do to keep track of what's happening. For example, while the async request is being performed we are in a *loading* state, and thus we might want to show a loading indicator in the UI. Or the loading may have failed, which means we need to do deal with error handling.

We will call this bit of bookkeeping the "status" of the item that is loaded. The goal of this library is to provide a standard interface for this status, as well as providing utilities to help you write the loader functions.


## Concepts

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
