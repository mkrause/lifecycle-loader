
import Loadable, { status } from '../loadable/Loadable.js';

// Loaders
import aggregateLoader from '../loader/aggregate_loader.js';
import localStorageLoader from '../loader/localstorage_loader.js';


export default {
    status,
    Loadable,
    localStorageLoader,
    aggregateLoader,
};
