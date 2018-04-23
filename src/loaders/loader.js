// @flow

// A *loader* is a function that takes an item (the current state), and returns a promise
// for that item (re)loaded. To create a loader, a loader creator may be used to build a
// loader function from some specification.

export type Loader = Loadable => Promise<Loadable>;

type LoaderSpec = mixed;
export type LoaderCreator = (...args : Array<LoaderSpec>) => Loader;
