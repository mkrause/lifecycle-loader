
# lifecycle-loader

This library is part of a collection of async data management utilities I call "lifecycle". The library defines the concept of a "loadable item", an object that may be loaded from some source (e.g. an API). In addition, it defines the concept of a "loader", which is a function that can perform a (possibly async) load request.


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
