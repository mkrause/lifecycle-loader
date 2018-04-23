// @flow
declare var describe : Function;
declare var it : Function;

import chai, { assert, expect } from 'chai';

import Loadable, { status } from '../src/loadable/Loadable.js';


describe('Loadable', () => {
    describe('construction', () => {
        // Note: cannot use `.to.include.keys(status)` to test for the inclusion of the status property,
        // because chai's `keys` assertion only works for enumerable properties. Use `status in obj` instead.
        
        it('should not be constructable from undefined', () => {
            expect(() => { Loadable(); }).to.throw(TypeError);
            expect(() => { Loadable(undefined); }).to.throw(TypeError);
        });
        
        it('should construct a Loadable without any properties from null', () => {
            expect(Loadable(null)).to.satisfy(subject => status in subject);
            expect(Loadable(42)[status]).to.have.property('ready', false);
        });
        
        it('should not be constructable from a boolean', () => {
            // Booleans cannot be represented as objects (while still maintaining their semantics)
            expect(() => { Loadable(true); }).to.throw(TypeError);
            expect(() => { Loadable(false); }).to.throw(TypeError);
        });
        
        it('should construct a Loadable from a primitive string', () => {
            expect(Loadable('foo')).to.satisfy(subject => status in subject);
            
            expect(Loadable('foo').toString()).to.equal('foo');
            expect(String(Loadable('foo'))).to.equal('foo');
        });
        
        it('should construct a Loadable from a primitive number', () => {
            expect(Loadable(42)).to.satisfy(subject => status in subject);
            
            expect(Loadable(42).valueOf()).to.equal(42);
            expect(Number(Loadable(42))).to.equal(42);
        });
        
        it('should construct a Loadable from a plain object', () => {
            expect(Loadable({ x: 42 })).to.satisfy(subject => status in subject);
            
            expect(Loadable({ x: 42 })).to.have.property('x', 42);
        });
        
        it('should construct a Loadable from a Date instance', () => {
            expect(Loadable(new Date('2018-01-01T03:24:00'))).to.satisfy(subject => status in subject);
            
            expect(Loadable(new Date('2018-01-01T03:24:00')).getFullYear()).to.equal(2018);
        });
    });
    
    describe('status methods', () => {
        it('should support update()', () => {
            const subject = Loadable({ x: 42 });
            
            const subjectUpdated = subject[status].update({ ready: true });
            
            expect(subjectUpdated).to.deep.equal(subject); // Should not be changed
            expect(subjectUpdated[status]).to.have.property('ready', true);
        });
        
        it('should support asReady()', () => {
            const subject = Loadable({ x: null });
            
            const subjectReady = subject[status].asReady({ x: 42 });
            
            expect(subjectReady).to.deep.equal({ x: 42 });
            expect(subjectReady[status]).to.have.property('ready', true);
        });
    });
});
