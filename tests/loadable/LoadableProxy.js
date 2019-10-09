
import chai, { assert, expect } from 'chai';

import { statusKey } from '../../lib-esm/interfaces/Status.js';
import LoadableProxy from '../../lib-esm/loadable/LoadableProxy.js';


describe('LoadableProxy', () => {
    describe('construction', () => {
        // Note: cannot use `.to.include.keys(status)` to test for the inclusion of the status property,
        // because chai's `keys` assertion only works for enumerable properties. Use `status in obj` instead.
        
        it('should not be constructable from undefined', () => {
            expect(() => { LoadableProxy(); }).to.throw(TypeError);
            expect(() => { LoadableProxy(undefined); }).to.throw(TypeError);
        });
        
        it('should construct a LoadableProxy without any properties from null', () => {
            expect(LoadableProxy(null)).to.satisfy(subject => statusKey in subject);
            expect(LoadableProxy(42)[statusKey]).to.have.property('ready', false);
        });
        
        it('should not be constructable from a boolean', () => {
            // Booleans cannot be represented as objects (while still maintaining their semantics)
            expect(() => { LoadableProxy(true); }).to.throw(TypeError);
            expect(() => { LoadableProxy(false); }).to.throw(TypeError);
        });
        
        it('should construct a LoadableProxy from a primitive string', () => {
            expect(LoadableProxy('foo')).to.satisfy(subject => statusKey in subject);
            
            expect(LoadableProxy('foo').toString()).to.equal('foo');
            expect(String(LoadableProxy('foo'))).to.equal('foo');
        });
        
        it('should construct a LoadableProxy from a primitive number', () => {
            expect(LoadableProxy(42)).to.satisfy(subject => statusKey in subject);
            
            expect(LoadableProxy(42).valueOf()).to.equal(42);
            expect(Number(LoadableProxy(42))).to.equal(42);
        });
        
        it('should construct a LoadableProxy from a plain object', () => {
            expect(LoadableProxy({ x: 42 })).to.satisfy(subject => statusKey in subject);
            
            expect(LoadableProxy({ x: 42 })).to.have.property('x', 42);
        });
        
        it('should construct a LoadableProxy from a Date instance', () => {
            expect(LoadableProxy(new Date('2018-01-01T03:24:00'))).to.satisfy(subject => statusKey in subject);
            
            expect(LoadableProxy(new Date('2018-01-01T03:24:00')).getFullYear()).to.equal(2018);
        });
    });
    
    /*
    describe('status methods', () => {
        it('should support update()', () => {
            const subject = LoadableProxy({ x: 42 });
            
            const subjectUpdated = subject[statusKey].update({ ready: true });
            
            expect(subjectUpdated).to.deep.equal(subject); // Should not be changed
            expect(subjectUpdated[statusKey]).to.have.property('ready', true);
        });
        
        it('should support asReady()', () => {
            const subject = LoadableProxy({ x: null });
            
            const subjectReady = subject[statusKey].asReady({ x: 42 });
            
            expect(subjectReady).to.deep.equal({ x: 42 });
            expect(subjectReady[statusKey]).to.have.property('ready', true);
        });
    });
    */
});
