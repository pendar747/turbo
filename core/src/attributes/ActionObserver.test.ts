import { fixture, elementUpdated } from "@open-wc/testing-helpers";
import { on } from "../util";
import ActionObserver from './ActionObserver';

describe('tb-action attribute', () => {

  let observer: ActionObserver;
  beforeEach(() => {
    observer = new ActionObserver(document.body, 'main', 'item');
  });

  afterEach(() => {
    observer.disconnect();
  });

  it('should fire the event bound to the element', async () => {
    const callback = jasmine.createSpy();
    on('main-action', callback);
    const el: HTMLButtonElement = await fixture(`<button tb-action="click:my-event">click</button>`);
    el.dispatchEvent(new MouseEvent('click'));

    expect(callback.calls.count()).toEqual(1);
    expect(callback.calls.argsFor(0)[0].detail).toEqual({
      model: 'item',
      actionName: 'my-event',
      data: {}
    });
  });
  
  it('should allow binding multiple events', async () => {
    const callback = jasmine.createSpy();
    const highlight = jasmine.createSpy();
    on('main-action', callback);
    const el: HTMLButtonElement = await fixture(`<button tb-action="click:my-event-2;mouseover:highlight">click</button>`);
    el.dispatchEvent(new MouseEvent('click'));
    el.dispatchEvent(new MouseEvent('mouseover'));

    expect(callback.calls.count()).toEqual(2);
    expect(callback.calls.argsFor(0)[0].detail).toEqual({
      model: 'item',
      actionName: 'my-event-2',
      data: {}
    });
    expect(callback.calls.argsFor(1)[0].detail).toEqual({
      model: 'item',
      actionName: 'highlight',
      data: {}
    });
  });
  
  it('should fire a different event when action attribute is changed', async () => {
    const myEventCallback = jasmine.createSpy();
    on('main-action', myEventCallback);
    const el: HTMLButtonElement = await fixture(`<button tb-action="click:my-event-3">click</button>`);
    el.setAttribute('tb-action', 'click:my-other-event');
    await elementUpdated(el);
    el.dispatchEvent(new MouseEvent('click'));

    expect(myEventCallback.calls.count()).toEqual(1);
    expect(myEventCallback.calls.argsFor(0)[0].detail).toEqual({
      model: 'item',
      actionName: 'my-other-event',
      data: {}
    });
  });
  
  it('should fire an extra event when an action attribute is added', async () => {
    const myEventCallback = jasmine.createSpy();
    on('main-action', myEventCallback);
    const el: HTMLButtonElement = await fixture(`<button tb-action="click:my-event-3">click</button>`);
    el.setAttribute('tb-action', 'click:my-other-event;mouseover:my-event-3');
    await elementUpdated(el);
    el.dispatchEvent(new MouseEvent('click'));
    el.dispatchEvent(new MouseEvent('mouseover'));

    expect(myEventCallback.calls.count()).toEqual(2);
    expect(myEventCallback.calls.argsFor(0)[0].detail).toEqual({
      model: 'item',
      actionName: 'my-other-event',
      data: {}
    });
    expect(myEventCallback.calls.argsFor(1)[0].detail).toEqual({
      model: 'item',
      actionName: 'my-event-3',
      data: {}
    });
  });
  
  it('should only fire the event once if registered twice', async () => {
    const myEventCallback = jasmine.createSpy();
    on('main-action', myEventCallback);
    const el: HTMLButtonElement = await fixture(`<button tb-action="click:my-event-3;click:my-event-3">click</button>`);
    el.dispatchEvent(new MouseEvent('click'));

    expect(myEventCallback.calls.count()).toEqual(1);
    expect(myEventCallback.calls.argsFor(0)[0].detail).toEqual({
      model: 'item',
      actionName: 'my-event-3',
      data: {}
    });
  });
  
  it('should not fire the event when attribute is removed', async () => {
    const myEventCallback = jasmine.createSpy();
    on('main-action', myEventCallback);
    const el: HTMLButtonElement = await fixture(`<button tb-action="click:my-event-3">click</button>`);
    el.removeAttribute('tb-action');
    await elementUpdated(el);
    el.dispatchEvent(new MouseEvent('click'));

    expect(myEventCallback.calls.count()).toEqual(0);
  });
  
  it('should fire the same user event for each dom event that it is assigned to', async () => {
    const myEventCallback = jasmine.createSpy();
    on('main-action', myEventCallback);
    const el: HTMLButtonElement = await fixture(`<button tb-action="click:my-event-3;mouseover:my-event-3">click</button>`);
    el.dispatchEvent(new MouseEvent('click'));
    el.dispatchEvent(new MouseEvent('mouseover'));

    expect(myEventCallback.calls.count()).toEqual(2);
    expect(myEventCallback.calls.argsFor(0)[0].detail).toEqual({
      model: 'item',
      actionName: 'my-event-3',
      data: {}
    });
    expect(myEventCallback.calls.argsFor(1)[0].detail).toEqual({
      model: 'item',
      actionName: 'my-event-3',
      data: {}
    });
  });

  it('should fire an event with data that is assigned to observeActions the beginning', async () => {
    observer.disconnect();
    observer = new ActionObserver(document.body, 'main', 'my-model');
    
    const myEventCallback = jasmine.createSpy();
    on('main-action', myEventCallback);
    const el: HTMLButtonElement = await fixture(`<button tb-action="click:my-event-3">click</button>`);
    el.dispatchEvent(new MouseEvent('click'));

    expect(myEventCallback.calls.count()).toEqual(1);
    expect(myEventCallback.calls.argsFor(0)[0].detail).toEqual({
      model: 'my-model',
      actionName: 'my-event-3',
      data: {}
    });
  });
  
  it('should fire multiple events with data that is assigned to observeActions the beginning', async () => {
    observer.disconnect();
    observer = new ActionObserver(document.body, 'main', 'my-model');
    
    const myEventCallback = jasmine.createSpy();
    on('main-action', myEventCallback);
    const el: HTMLButtonElement = await fixture(`<button tb-action="click:my-event-3;mouseover:my-event-2">click</button>`);
    el.dispatchEvent(new MouseEvent('click'));
    el.dispatchEvent(new MouseEvent('mouseover'));

    expect(myEventCallback.calls.count()).toEqual(2);
    expect(myEventCallback.calls.argsFor(0)[0].detail).toEqual({ 
      model: 'my-model',
      actionName: 'my-event-3',
      data: {}
    });
    expect(myEventCallback.calls.argsFor(1)[0].detail).toEqual({ 
      model: 'my-model',
      actionName: 'my-event-2',
      data: {}
    });
  });

  it('should also include the data that is attached to the element target itself', async () => {
    observer.disconnect();
    observer = new ActionObserver(document.body, 'main', 'my-model');
    
    const myEventCallback = jasmine.createSpy();
    on('main-action', myEventCallback);
    const el: HTMLButtonElement = await fixture(`<button data-latency="3ms" tb-action="click:my-event-3">click</button>`);
    el.dispatchEvent(new MouseEvent('click'));

    expect(myEventCallback.calls.count()).toEqual(1);
    expect(myEventCallback.calls.argsFor(0)[0].detail).toEqual({ 
      actionName: 'my-event-3',
      model: 'my-model', 
      data: {
        latency: '3ms'
      }
    });
  });
    
  it('should fire multiple events with the element data that is assigned to observeActions the beginning', async () => {
    observer.disconnect();
    observer = new ActionObserver(document.body, 'main', 'my-model');
    
    const myEventCallback = jasmine.createSpy();
    on('main-action', myEventCallback);
    const el: HTMLButtonElement = await fixture(`<button data-latency="3ms" tb-action="click:my-event-3;mouseover:my-event-2">click</button>`);
    el.dispatchEvent(new MouseEvent('click'));
    el.dispatchEvent(new MouseEvent('mouseover'));

    expect(myEventCallback.calls.count()).toEqual(2);
    expect(myEventCallback.calls.argsFor(0)[0].detail)
      .toEqual({ 
        model: 'my-model', 
        data: {
          latency: '3ms'
        },
        actionName: 'my-event-3'
      });
    expect(myEventCallback.calls.argsFor(1)[0].detail)
      .toEqual({ 
        model: 'my-model', 
        data: {
          latency: '3ms' 
        },
        actionName: 'my-event-2'
      });
  });
  
  it('should also include value of the target element in event data', async () => {
    observer.disconnect();
    observer = new ActionObserver(document.body, 'main', 'my-model');
    
    const myEventCallback = jasmine.createSpy();
    on('main-action', myEventCallback);
    const el: HTMLButtonElement = await fixture(`<input value="Pete" tb-action="keyup:my-event-3">`);
    el.dispatchEvent(new KeyboardEvent('keyup'));

    expect(myEventCallback.calls.count()).toEqual(1);
    expect(myEventCallback.calls.argsFor(0)[0].detail).toEqual({ 
      model: 'my-model',
      data: {
        value: 'Pete' 
      },
      actionName: 'my-event-3'
    });
  });
});