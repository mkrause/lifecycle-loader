declare type Extension = {
    [key in PropertyKey]: unknown;
};
export declare const proxyKey: unique symbol;
declare type Proxied<V, E> = E & (V extends undefined ? never : V extends null ? {} : V extends string ? String : V extends number ? Number : V extends bigint ? never : V extends boolean ? never : V extends symbol ? never : V);
export declare const ProxyWrapper: <V, E extends Extension>(value: V, extension?: E) => Proxied<V, E>;
export declare const registerProxyFormatter: () => void;
export default ProxyWrapper;
//# sourceMappingURL=ProxyWrapper.d.ts.map