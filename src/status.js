// @flow

/*
A *status* is an object that describes the current loading state of some application state.

Status flags:
  - ready: indicates whether this item can be used or not (whether the data can be read safely)
  - loading: indicates whether we are currently in the process of loading this item
  - error: indicates that the last load attempt resulted in an error

Note that each of the flags is independent, rather than being a linear transition (e.g. loading -> ready).
This is so that we can, for example, start loading new data while keeping information such as an error
state, for UI purposes. All the possible combinations listed below.

- !ready + !loading + !error     "pending", nothing done yet, not even attempted to load
- !ready +  loading + !error     "loading", for the first time, no older data available
-  ready + !loading + !error     "idle", can use the data as needed
-  ready +  loading + !error     "reloading", loading but there is still data available to show
- !ready + !loading +  error     failed, and not yet any attempt to retry (no older data available)
- !ready +  loading +  error     failed, but we're currently retrying (no older data available)
-  ready + !loading +  error     failed, and not yet any attempt to retry (there is older data available)
-  ready +  loading +  error     failed, but we're currently retrying (there is older data available)
*/

export type Status = {
    ready : boolean,
    loading : boolean,
    error : ?Error,
};

// export default Symbol('status');
export default '__status__';
