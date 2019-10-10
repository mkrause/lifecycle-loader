
import { statusKey, Status } from '../interfaces/Status.js';
import { itemKey, Loadable } from '../interfaces/Loadable.js';


// type StatusMethods<T> = {
//     asReady : (item : T) => Loadable<T>,
//     asFailed : (reason : Error) => Loadable<T>,
//     asLoading : () => Loadable<T>,
// };

// type LoadableWithUpdates<T> = Loadable<T> & { [statusKey] : Status & StatusMethods<T> };

const LoadableSimple = <T>(item : null | T) : Loadable<T> => ({
    [itemKey]: item,
    [statusKey]: {
        ready: false,
        loading: false,
        error: null,
        asReady: function(this : Loadable<T>, itemReady : T) {
            // const itemCurrent = this;
            const itemCurrent = LoadableSimple(item);
            return {
                ...itemCurrent,
                [itemKey]: itemReady,
                [statusKey]: { ...itemCurrent[statusKey], ready: true },
            };
        },
        asFailed: function(this : Loadable<T>, reason : Error) {
            // const itemCurrent = this;
            const itemCurrent = LoadableSimple(item);
            return {
                ...itemCurrent,
                [statusKey]: { ...itemCurrent[statusKey], error: reason },
            };
        },
        asLoading: function(this : Loadable<T>) {
            // const itemCurrent = this;
            const itemCurrent = LoadableSimple(item);
            return {
                ...itemCurrent,
                [statusKey]: { ...itemCurrent[statusKey], loading: true },
            };
        },
    },
});

export default LoadableSimple;
