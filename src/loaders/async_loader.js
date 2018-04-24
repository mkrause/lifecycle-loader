
import { status } from '../loadable/Loadable.js';


// Trivial asynchronous loader: just resolve with the given constant
export default constant => current => {
    const resolvedPromise = new Promise(resolve => {
        setTimeout(() => resolve(current[status].asReady(constant)), 0);
    });
    
    resolvedPromise.subscribe = fn => {
        fn(current[status].asLoading());
        resolvedPromise.then(fn);
        return resolvedPromise;
    };
    
    return resolvedPromise;
};
