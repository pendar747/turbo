import { fixture, elementUpdated } from "@open-wc/testing-helpers";
import { on } from "../util";
import observeActions from './observeActions';

describe('tb-action attribute', () => {

  let observer: MutationObserver;
  beforeEach(() => {
    observer = observeActions(document.body);
  });

  afterEach(() => {
    observer.disconnect();
  });

  it('should fire the event bound to the element', async () => {
    const callback = jasmine.createSpy();
    on('my-event', callback);
    const el: HTMLButtonElement = await fixture(`<button tb-action="click:my-event">click</button>`);
    el.dispatchEvent(new MouseEvent('click'));

    expect(callback.calls.count()).toEqual(1);
  });
  
  it('should allow binding multiple events', async () => {
    const callback = jasmine.createSpy();
    const highlight = jasmine.createSpy();
    on('my-event-2', callback);
    on('highlight', highlight);
    const el: HTMLButtonElement = await fixture(`<button tb-action="click:my-event-2;mouseover:highlight">click</button>`);
    el.dispatchEvent(new MouseEvent('click'));
    el.dispatchEvent(new MouseEvent('mouseover'));

    expect(callback.calls.count()).toEqual(1);
    expect(highlight.calls.count()).toEqual(1);
  });
  
  it('should fire a different event when action attribute is changed', async () => {
    const myEventCallback = jasmine.createSpy();
    const myOtherEventCallback = jasmine.createSpy();
    on('my-event-3', myEventCallback);
    on('my-other-event', myOtherEventCallback);
    const el: HTMLButtonElement = await fixture(`<button tb-action="click:my-event-3">click</button>`);
    el.setAttribute('tb-action', 'click:my-other-event');
    await elementUpdated(el);
    el.dispatchEvent(new MouseEvent('click'));

    expect(myEventCallback.calls.count()).toEqual(0);
    expect(myOtherEventCallback.calls.count()).toEqual(1);
  });
  
  it('should fire an extra event when an action attribute is added', async () => {
    const myEventCallback = jasmine.createSpy();
    const myOtherEventCallback = jasmine.createSpy();
    on('my-event-3', myEventCallback);
    on('my-other-event', myOtherEventCallback);
    const el: HTMLButtonElement = await fixture(`<button tb-action="click:my-event-3">click</button>`);
    el.setAttribute('tb-action', 'click:my-other-event;click:my-event-3');
    await elementUpdated(el);
    el.dispatchEvent(new MouseEvent('click'));

    expect(myEventCallback.calls.count()).toEqual(1);
    expect(myOtherEventCallback.calls.count()).toEqual(1);
  });
  
  it('should only fire the event once if registered twice', async () => {
    const myEventCallback = jasmine.createSpy();
    on('my-event-3', myEventCallback);
    const el: HTMLButtonElement = await fixture(`<button tb-action="click:my-event-3;click:my-event-3">click</button>`);
    el.dispatchEvent(new MouseEvent('click'));

    expect(myEventCallback.calls.count()).toEqual(1);
  });
  
  it('should not fire the event when attribute is removed', async () => {
    const myEventCallback = jasmine.createSpy();
    on('my-event-3', myEventCallback);
    const el: HTMLButtonElement = await fixture(`<button tb-action="click:my-event-3">click</button>`);
    el.removeAttribute('tb-action');
    await elementUpdated(el);
    el.dispatchEvent(new MouseEvent('click'));

    expect(myEventCallback.calls.count()).toEqual(0);
  });
  
  it('should fire the same user event for each dom event that it is assigned to', async () => {
    const myEventCallback = jasmine.createSpy();
    on('my-event-3', myEventCallback);
    const el: HTMLButtonElement = await fixture(`<button tb-action="click:my-event-3;mouseover:my-event-3">click</button>`);
    el.dispatchEvent(new MouseEvent('click'));
    el.dispatchEvent(new MouseEvent('mouseover'));

    expect(myEventCallback.calls.count()).toEqual(2);
  });

  it('should fire an event with data that is assigned to observeActions the beginning', async () => {
    observer.disconnect();
    observer = observeActions(document.body, { model: 'my-model' });
    
    const myEventCallback = jasmine.createSpy();
    on('my-event-3', myEventCallback);
    const el: HTMLButtonElement = await fixture(`<button tb-action="click:my-event-3">click</button>`);
    el.dispatchEvent(new MouseEvent('click'));

    expect(myEventCallback.calls.count()).toEqual(1);
    expect(myEventCallback.calls.argsFor(0)[0]).toBeInstanceOf(CustomEvent);
    expect(myEventCallback.calls.argsFor(0)[0].detail).toEqual({ model: 'my-model' });
  });
  
  it('should fire multiple events with data that is assigned to observeActions the beginning', async () => {
    observer.disconnect();
    observer = observeActions(document.body, { model: 'my-model' });
    
    const myEventCallback = jasmine.createSpy();
    const mouseOverCallback = jasmine.createSpy();
    on('my-event-3', myEventCallback);
    on('my-event-2', mouseOverCallback);
    const el: HTMLButtonElement = await fixture(`<button tb-action="click:my-event-3;mouseover:my-event-2">click</button>`);
    el.dispatchEvent(new MouseEvent('click'));
    el.dispatchEvent(new MouseEvent('mouseover'));

    expect(myEventCallback.calls.count()).toEqual(1);
    expect(mouseOverCallback.calls.count()).toEqual(1);
    expect(myEventCallback.calls.argsFor(0)[0]).toBeInstanceOf(CustomEvent);
    expect(mouseOverCallback.calls.argsFor(0)[0]).toBeInstanceOf(CustomEvent);
    expect(myEventCallback.calls.argsFor(0)[0].detail).toEqual({ model: 'my-model' });
    expect(mouseOverCallback.calls.argsFor(0)[0].detail).toEqual({ model: 'my-model' });
  });

  it('should also include the data that is attached to the element target itself', async () => {
    observer.disconnect();
    observer = observeActions(document.body, { model: 'my-model' });
    
    const myEventCallback = jasmine.createSpy();
    on('my-event-3', myEventCallback);
    const el: HTMLButtonElement = await fixture(`<button data-latency="3ms" tb-action="click:my-event-3">click</button>`);
    el.dispatchEvent(new MouseEvent('click'));

    expect(myEventCallback.calls.count()).toEqual(1);
    expect(myEventCallback.calls.argsFor(0)[0]).toBeInstanceOf(CustomEvent);
    expect(myEventCallback.calls.argsFor(0)[0].detail).toEqual({ model: 'my-model', latency: '3ms' });
  });
  
  it('should override the observer data with the element data if the property names clash', async () => {
    observer.disconnect();
    observer = observeActions(document.body, { model: 'my-model' });
    
    const myEventCallback = jasmine.createSpy();
    on('my-event-3', myEventCallback);
    const el: HTMLButtonElement = await fixture(`<button data-model="something-else" tb-action="click:my-event-3">click</button>`);
    el.dispatchEvent(new MouseEvent('click'));

    expect(myEventCallback.calls.count()).toEqual(1);
    expect(myEventCallback.calls.argsFor(0)[0]).toBeInstanceOf(CustomEvent);
    expect(myEventCallback.calls.argsFor(0)[0].detail).toEqual({ model: 'something-else' });
  });
  
  it('should fire multiple events with the element data that is assigned to observeActions the beginning', async () => {
    observer.disconnect();
    observer = observeActions(document.body, { model: 'my-model' });
    
    const myEventCallback = jasmine.createSpy();
    const mouseOverCallback = jasmine.createSpy();
    on('my-event-3', myEventCallback);
    on('my-event-2', mouseOverCallback);
    const el: HTMLButtonElement = await fixture(`<button data-latency="3ms" tb-action="click:my-event-3;mouseover:my-event-2">click</button>`);
    el.dispatchEvent(new MouseEvent('click'));
    el.dispatchEvent(new MouseEvent('mouseover'));

    expect(myEventCallback.calls.count()).toEqual(1);
    expect(mouseOverCallback.calls.count()).toEqual(1);
    expect(myEventCallback.calls.argsFor(0)[0]).toBeInstanceOf(CustomEvent);
    expect(mouseOverCallback.calls.argsFor(0)[0]).toBeInstanceOf(CustomEvent);
    expect(myEventCallback.calls.argsFor(0)[0].detail).toEqual({ model: 'my-model', latency: '3ms' });
    expect(mouseOverCallback.calls.argsFor(0)[0].detail).toEqual({ model: 'my-model', latency: '3ms' });
  });
});