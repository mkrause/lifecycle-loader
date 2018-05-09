
# lifecycle-loader

This library is part of a collection of async data management utilities that I've dubbed "lifecycle". The library defines the concept of a "loadable item", an object that may be loaded from some source (e.g. an API). In addition, it defines the concept of a "loader", which is a function that can perform a (possibly async) load request.

This concept is similar to the standard Promise mechanism in JavaScript, but differs in a few key ways.


## Loadable

```js
import { status } from 'lifecycle-loader';

type Status = {
    ready : boolean,
    loading : boolean,
    error : ?Error,
};

interface Loadable = {
    [status] : Status,
};
```

To make an existing type into a loadable item, ...


## Loader

```js
import { constLoader } from 'lifecycle-loader';

const loadFortyTwo = constLoader(42);

const fortyTwo = await loadFortyTwo();

```
