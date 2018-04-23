
import Loadable, { status } from '../loadable/Loadable.js';

// Loaders
import aggregateLoader from '../loaders/aggregate_loader.js';
import localStorageLoader from '../loaders/localstorage_loader.js';


export default {
    status,
    Loadable,
    localStorageLoader,
    aggregateLoader,
};
