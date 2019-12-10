
import chai, { assert, expect } from 'chai';

import * as Loadable from '../../lib-esm/interfaces/Loadable.js';


describe('Loadable', () => {
    describe('status', () => {
        it('should expose a unique status symbol', () => {
            expect(typeof Loadable.statusKey).to.equal('symbol');
            expect(Loadable.statusKey.description).to.equal('lifecycle.loadable.status');
        });
    });
    
    describe('LoadableSimple', () => {
        const LoadableSimple = Loadable.LoadableSimple;
        
        describe('construction', () => {
            it('should not be constructable from undefined', () => {
                expect(() => { LoadableSimple(); }).to.throw(TypeError);
                expect(() => { LoadableSimple(undefined); }).to.throw(TypeError);
            });
            
            it('should construct a loadable item from `null` (default status)', () => {
                const loadable = LoadableSimple(null);
                expect(loadable).to.have.property(Loadable.itemKey).to.equal(null);
                expect(loadable).to.have.property(Loadable.statusKey).to.deep.equal({
                    ready: false,
                    loading: false,
                    error: null,
                });
                
                // Aliases
                expect(loadable).to.have.property('item').to.equal(null);
                expect(loadable).to.have.property('status').to.deep.equal({
                    ready: false,
                    loading: false,
                    error: null,
                });
            });
            
            it('should accept a partial status', () => {
                const loadable = LoadableSimple(null, { ready: true });
                expect(loadable).to.have.property(Loadable.statusKey).to.deep.equal({
                    ready: true,
                    loading: false,
                    error: null,
                });
            });
            
            it('should construct a loadable item from non-trivial item and complete status', () => {
                const reason = new Error('foo');
                const loadable = LoadableSimple({ name: 'john' }, { ready: true, loading: true, error: reason });
                
                [Loadable.itemKey, 'item'].forEach(key => {
                    expect(loadable).to.have.property(key).to.deep.equal({ name: 'john' });
                });
                
                [Loadable.statusKey, 'status'].forEach(key => {
                    expect(loadable).to.have.property(key).to.deep.equal({
                        ready: true,
                        loading: true,
                        error: reason,
                    });
                });
            });
        });
        
        describe('updating', () => {
            const loadable = LoadableSimple({ name: 'john' });
            
            it('should be able to construct a new loadable item using an existing LoadableSimple instance', () => {
                const loadableConstructed = loadable[Loadable.constructKey](
                    { name: 'alice' },
                    { loading: true },
                );
                
                [Loadable.itemKey, 'item'].forEach(key => {
                    expect(loadableConstructed).to.have.property(key).to.deep.equal({ name: 'alice' });
                });
                
                [Loadable.statusKey, 'status'].forEach(key => {
                    expect(loadableConstructed).to.have.property(key).to.deep.equal({
                        ready: false,
                        loading: true,
                        error: null,
                    });
                });
            });
            
            it('should be able to convert an existing loadable item to loading using `asLoading`', () => {
                const loadableLoading = Loadable.asLoading(loadable);
                
                [Loadable.itemKey, 'item'].forEach(key => {
                    expect(loadableLoading).to.have.property(key).to.deep.equal({ name: 'john' });
                });
                
                [Loadable.statusKey, 'status'].forEach(key => {
                    expect(loadableLoading).to.have.property(key).to.deep.equal({
                        ready: false,
                        loading: true, // Set to `true`
                        error: null,
                    });
                });
            });
            
            it('should be able to convert an existing loadable item to ready using `asReady`', () => {
                // Without new item
                const loadableReady1 = Loadable.asReady(loadable);
                
                [Loadable.itemKey, 'item'].forEach(key => {
                    expect(loadableReady1).to.have.property(key).to.deep.equal({ name: 'john' });
                });
                
                [Loadable.statusKey, 'status'].forEach(key => {
                    expect(loadableReady1).to.have.property(key).to.deep.equal({
                        ready: true, // Set to `true`
                        loading: false,
                        error: null,
                    });
                });
                
                // With new item
                const loadableReady2 = Loadable.asReady(loadable, { name: 'alice' });
                
                [Loadable.itemKey, 'item'].forEach(key => {
                    expect(loadableReady2).to.have.property(key).to.deep.equal({ name: 'alice' });
                });
                
                [Loadable.statusKey, 'status'].forEach(key => {
                    expect(loadableReady2).to.have.property(key).to.deep.equal({
                        ready: true, // Set to `true`
                        loading: false,
                        error: null,
                    });
                });
            });
            
            it('should be able to convert an existing loadable item to failed using `asFailed`', () => {
                const reason = new Error('fail');
                const loadableFailed = Loadable.asFailed(loadable, reason);
                
                [Loadable.itemKey, 'item'].forEach(key => {
                    expect(loadableFailed).to.have.property(key).to.deep.equal({ name: 'john' });
                });
                
                [Loadable.statusKey, 'status'].forEach(key => {
                    expect(loadableFailed).to.have.property(key).to.deep.equal({
                        ready: false,
                        loading: false,
                        error: reason,
                    });
                });
            });
        });
    });
    
    describe('LoadableProxy', () => {
        const LoadableProxy = Loadable.LoadableProxy;
        
        describe('construction', () => {
            it('should not be constructable from undefined', () => {
                expect(() => { LoadableProxy(); }).to.throw(TypeError);
                expect(() => { LoadableProxy(undefined); }).to.throw(TypeError);
            });
            
            it('should construct a LoadableProxy without any properties from null', () => {
                expect(LoadableProxy(null)).to.have.property(Loadable.statusKey);
                expect(LoadableProxy(42)[Loadable.statusKey]).to.have.property('ready', false);
            });
            
            it('should not be constructable from a boolean', () => {
                // Booleans cannot be represented as objects (while still maintaining their semantics)
                expect(() => { LoadableProxy(true); }).to.throw(TypeError);
                expect(() => { LoadableProxy(false); }).to.throw(TypeError);
            });
            
            it('should construct a LoadableProxy from a primitive string', () => {
                expect(LoadableProxy('foo')).to.have.property(Loadable.statusKey);
                
                expect(LoadableProxy('foo').toString()).to.equal('foo');
                expect(String(LoadableProxy('foo'))).to.equal('foo');
            });
            
            it('should construct a LoadableProxy from a primitive number', () => {
                expect(LoadableProxy(42)).to.have.property(Loadable.statusKey);
                
                expect(LoadableProxy(42).valueOf()).to.equal(42);
                expect(Number(LoadableProxy(42))).to.equal(42);
            });
            
            it('should construct a LoadableProxy from a plain object', () => {
                expect(LoadableProxy({ x: 42 })).to.have.property(Loadable.statusKey);
                
                expect(LoadableProxy({ x: 42 })).to.have.property('x', 42);
            });
            
            it('should construct a LoadableProxy from a Date instance', () => {
                expect(LoadableProxy(new Date('2018-01-01T03:24:00'))).to.have.property(Loadable.statusKey);
                
                expect(LoadableProxy(new Date('2018-01-01T03:24:00')).getFullYear()).to.equal(2018);
            });
        });
        
        describe('updating', () => {
            const loadable = LoadableProxy({ name: 'john' });
            
            it('should be able to construct a new loadable item using an existing LoadableProxy instance', () => {
                const loadableConstructed = loadable[Loadable.constructKey](
                    { name: 'alice' },
                    { loading: true },
                );
                
                expect(loadableConstructed).to.deep.equal({ name: 'alice' });
                
                expect(loadableConstructed).to.have.property(Loadable.statusKey).to.deep.equal({
                    ready: false,
                    loading: true,
                    error: null,
                });
            });
            
            it('should be able to convert an existing loadable item to loading using `asLoading`', () => {
                const loadableLoading = Loadable.asLoading(loadable);
                
                expect(loadableLoading).to.deep.equal({ name: 'john' });
                
                expect(loadableLoading).to.have.property(Loadable.statusKey).to.deep.equal({
                    ready: false,
                    loading: true, // Set to `true`
                    error: null,
                });
            });
            
            it('should be able to convert an existing loadable item to ready using `asReady`', () => {
                // Without new item
                const loadableReady1 = Loadable.asReady(loadable);
                
                expect(loadableReady1).to.deep.equal({ name: 'john' });
                
                expect(loadableReady1).to.have.property(Loadable.statusKey).to.deep.equal({
                    ready: true, // Set to `true`
                    loading: false,
                    error: null,
                });
                
                // With new item
                const loadableReady2 = Loadable.asReady(loadable, { name: 'alice' });
                
                expect(loadableReady2).to.deep.equal({ name: 'alice' });
                
                expect(loadableReady2).to.have.property(Loadable.statusKey).to.deep.equal({
                    ready: true, // Set to `true`
                    loading: false,
                    error: null,
                });
            });
            
            it('should be able to convert an existing loadable item to failed using `asFailed`', () => {
                const reason = new Error('fail');
                const loadableFailed = Loadable.asFailed(loadable, reason);
                
                expect(loadableFailed).to.deep.equal({ name: 'john' });
                
                expect(loadableFailed).to.have.property(Loadable.statusKey).to.deep.equal({
                    ready: false,
                    loading: false,
                    error: reason,
                });
            });
        });
    });
});
