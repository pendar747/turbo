import { fixture, elementUpdated } from "@open-wc/testing-helpers";
import { on } from "../util";
import observeActions from './observeActions';

describe('tb-action attribute', () => {

  beforeAll(() => {
    observeActions(document.body);
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
});