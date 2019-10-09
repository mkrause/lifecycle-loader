
import chai, { assert, expect } from 'chai';

import ProxyWrapper, { isProxyKey } from '../../lib-esm/util/ProxyWrapper.js';


describe('ProxyWrapper', () => {
    it('should return a proxy', () => {
        const proxy = ProxyWrapper(null, { ext: 42 });
        
        expect(proxy).to.have.property(isProxyKey);
    });
    
    it('should not allow undefined', () => {
        expect(() => { ProxyWrapper(undefined, { ext: 42 }) }).to.throw(TypeError);
    });
    
    it('should simulate null as empty object', () => {
        const proxy = ProxyWrapper(null, { ext: 42 });
        
        expect(typeof proxy).to.equal('object');
        expect(Object.getPrototypeOf(proxy)).to.equal(null);
        
        expect(proxy).to.not.equal(null); // Cannot trap equality
        expect(Reflect.ownKeys(proxy)).to.deep.equal([]); // Should be empty
        expect(Object.keys(proxy)).to.deep.equal([]); // Should be empty
    });
    
    it('should simulate string as boxed String', () => {
        const proxy = ProxyWrapper('foo', { ext: 42 });
        
        expect(typeof proxy).to.equal('object');
        expect(proxy).to.be.an.instanceOf(String);
        
        expect(String(proxy)).to.equal('foo');
        expect(proxy.valueOf()).to.equal('foo');
        
        expect(proxy.toJSON()).to.equal('foo'); // Should also support `toJSON` (not a standard part of `String`)
        expect(JSON.stringify(proxy)).to.equal(`"foo"`);
        
        expect(proxy.substring(0, 2)).to.equal('fo');
    });
    
    it('should simulate number as boxed Number', () => {
        const proxy = ProxyWrapper(42, { ext: 42 });
        
        expect(typeof proxy).to.equal('object');
        expect(proxy).to.be.an.instanceOf(Number);
        
        expect(Number(proxy)).to.equal(42);
        expect(proxy.valueOf()).to.equal(42);
        
        expect(proxy.toJSON()).to.equal(42); // Should also support `toJSON` (not a standard part of `Number`)
        expect(JSON.stringify(proxy)).to.equal(`42`);
        
        expect(proxy + 1).to.equal(43);
    });
    
    it('should not allow boolean', () => {
        expect(() => { ProxyWrapper(true, { ext: 42 }) }).to.throw(TypeError);
        expect(() => { ProxyWrapper(false, { ext: 42 }) }).to.throw(TypeError);
    });
    
    it('should not allow symbol', () => {
        expect(() => { ProxyWrapper(Symbol('symbol'), { ext: 42 }) }).to.throw(TypeError);
    });
    
    it('should allow accessing extension properties', () => {
        const proxy = ProxyWrapper(null, { ext: 42 });
        
        expect(proxy).to.have.property('ext', 42);
        expect(proxy.ext).to.equal(42);
    });
    
    it('should allow symbols as extension keys', () => {
        const sym = Symbol('sym');
        
        const proxy = ProxyWrapper(null, { [sym]: 'internal' });
        
        expect(proxy).to.have.property(sym, 'internal');
        expect(proxy[sym]).to.equal('internal');
    });
    
    it('should allow getting property descriptors', () => {
        const body = { name: 'John' };
        const proxy = ProxyWrapper(body, { ext: 42 });
        
        expect(Object.getOwnPropertyDescriptor(proxy, 'name')).to.deep.equal(
            Object.getOwnPropertyDescriptor(body, 'name')
        );
        expect(Object.getOwnPropertyDescriptor(proxy, 'ext')).to.deep.equal({
            value: 42,
            enumerable: false,
            configurable: true,
            writable: false,
        });
    });
    
    it('should allow spreading to get only the body properties', () => {
        const proxy = ProxyWrapper({ name: 'John', score: 10 }, { ext: 42 });
        
        expect({ ...proxy }).to.deep.equal({ name: 'John', score: 10 });
    });
});
