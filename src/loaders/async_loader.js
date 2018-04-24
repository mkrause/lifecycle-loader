
import status from '../status.js';

import { LoadablePromise } from '../loader.js';


// Trivial asynchronous loader: just resolve with the given constant
export default constant => current => {
    return new LoadablePromise(
        resolve => {
            setTimeout(() => { resolve(constant); }, 0);
        },
        current
    );
};
