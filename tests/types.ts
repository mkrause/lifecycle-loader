
import { expectTypeOf } from 'expect-type';

import type { Proxyable, ProxyableExternal } from 'proxy-extend';
import Loadable from '../src/index.js';


{
    const test1 : Loadable<null> = Loadable.Proxy();
    const test2 : Loadable<null> = Loadable.Proxy(null);
    const test3 : Loadable<'foo'> & ProxyableExternal<string> = Loadable.Proxy('foo');
    const test4 : Loadable<42> & ProxyableExternal<number> = Loadable.Proxy(42);
};

{
    const test1 : Loadable<null> = Loadable.asReady(Loadable.Proxy());
    const test2 : Loadable<null> = Loadable.asLoading(Loadable.Proxy());
    const test3 : Loadable<null> = Loadable.asFailed(Loadable.Proxy(), new Error('fail'));
};
