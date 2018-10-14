
import status from '../interfaces/status.js';

import { LoadablePromise } from '../interfaces/loader.js';


// Trivial asynchronous loader: just resolve with the given constant
export default constant => current => {
    return new LoadablePromise(
        resolve => {
            setTimeout(() => { resolve(constant); }, 0);
        },
        current
    );
};
