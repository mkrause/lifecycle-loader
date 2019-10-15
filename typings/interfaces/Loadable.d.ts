import { statusKey, Status } from './Status.js';
export declare const itemKey: unique symbol;
export declare type StatusMethods<T> = {
    asReady: (item: T) => Loadable<T>;
    asFailed: (reason: Error) => Loadable<T>;
    asLoading: () => Loadable<T>;
};
export declare type Loadable<T> = {
    [itemKey]: null | T;
    [statusKey]: Status & StatusMethods<T>;
};
//# sourceMappingURL=Loadable.d.ts.map