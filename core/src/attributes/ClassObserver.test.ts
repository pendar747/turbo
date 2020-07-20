import { fixture, elementUpdated } from "@open-wc/testing-helpers";
import ClassObserver from "./ClassObserver";
import { on } from "../util";

describe('px-class attribute', () => {

  let observer: ClassObserver;
  afterEach(() => {
    observer.disconnect();
  });

  it('should add classes defined in condition:my-class to the element when the condition is true', async () => {
    const el = await fixture(`<div px-class="isRead:highlighted"></div>`);

    observer = new ClassObserver(el, { isRead: true }, 'main', 'item');

    expect(el.className).toContain('highlighted');
  });

  it('should dispatch getters for the defined properties', async () => {

    const el = await fixture(`<div px-class="isRead:highlighted;isRecent:recent-color"></div>`);
    const eventHandler = jasmine.createSpy();
    on('main-add-getters', eventHandler);

    observer = new ClassObserver(el, { isRead: true }, 'main', 'item');

    expect(eventHandler.calls.argsFor(0)[0].detail).toEqual(['item.isRead', 'item.isRecent']);
  });
  
  it('should not dispatch getters if they have already been dispatched', async () => {

    const el = await fixture(`<div px-class="isRead:highlighted;isRecent:recent-color"></div>`);
    const eventHandler = jasmine.createSpy();
    on('main-add-getters', eventHandler);

    observer = new ClassObserver(el, { isRead: true }, 'main', 'item');

    el.setAttribute('px-class', 'isRead:blue-color;isMeta:meta-styling');

    await elementUpdated(el);
    expect(eventHandler.calls.argsFor(1)[0].detail).toEqual(['item.isMeta']);
  });
  
  it('should dispatch all getters to the new state if the state is changed', async () => {

    const el = await fixture(`<div px-class="isRead:highlighted;isRecent:recent-color"></div>`);
    const eventHandler = jasmine.createSpy();

    observer = new ClassObserver(el, { isRead: true }, 'main', 'item');

    on('list-add-getters', eventHandler);

    observer.stateName = 'list';

    expect(eventHandler.calls.argsFor(0)[0].detail).toEqual(['item.isRead', 'item.isRecent']);
  });
  
  it('should dispatch all getters again if the model is changed', async () => {

    const el = await fixture(`<div px-class="isRead:highlighted;isRecent:recent-color"></div>`);
    const eventHandler = jasmine.createSpy();
    
    on('main-add-getters', eventHandler);

    observer = new ClassObserver(el, { isRead: true }, 'main', 'item');

    observer.model = 'profile';

    expect(eventHandler.calls.argsFor(1)[0].detail).toEqual(['profile.isRead', 'profile.isRecent']);
  });
    
  it('should apply multiple classes for a condition', async () => {
    const el = await fixture(`<div px-class="isRead:highlighted,border"></div>`);

    observer = new ClassObserver(el, { isRead: true }, 'main', 'item');

    expect(el.className).toContain('highlighted');
    expect(el.className).toContain('border');
  });
  
  it('should add apply multiple conditions', async () => {
    const el = await fixture(`<div px-class="isRead:highlighted;isNew:red"></div>`);

    observer = new ClassObserver(el, { isRead: true, isNew: true }, 'main', 'item');

    expect(el.className).toContain('highlighted');
    expect(el.className).toContain('red');
  });
  
  it('should reapply the classes when data changes', async () => {
    const el = await fixture(`<div px-class="isRead:highlighted;isNew:red"></div>`);

    observer = new ClassObserver(el, { isRead: true, isNew: true }, 'main', 'item');

    expect(el.className).toContain('highlighted');
    expect(el.className).toContain('red');

    observer.data = { isRead: false, isNew: true };

    expect(el.className).not.toContain('highlighted');
    expect(el.className).toContain('red');
  });
  
  it('should apply classnames when element is nested in target node', async () => {
    const el = await fixture(`<div><div><div id="my-div" px-class="isRead:highlighted"></div></div></div>`);

    observer = new ClassObserver(el, { isRead: true }, 'main', 'item');

    expect(el.querySelector('#my-div')?.className).toContain('highlighted');
  });
  
  it('should apply classnames when element is added later', async () => {
    const parent = await fixture(`<div></div>`);
    
    observer = new ClassObserver(parent, { isRead: true }, 'main', 'item');

    const el = await fixture('<div id="my-div" px-class="isRead:highlighted"></div>', { parentNode: parent });

    expect(el.className).toContain('highlighted');
  });
  
  it('should apply classnames when element is added later nested inside another element', async () => {
    const parent = await fixture(`<div></div>`);
    
    observer = new ClassObserver(parent, { isRead: true }, 'main', 'item');

    const el = await fixture('<div><div id="my-div" px-class="isRead:highlighted"></div></div>', { parentNode: parent });

    expect(el.querySelector('#my-div')?.className).toContain('highlighted');
  });
  
  it('should apply classnames when attribute is set later', async () => {
    const el = await fixture(`<div><div><div id="my-div"></div></div></div>`);
    
    observer = new ClassObserver(el, { isRead: true }, 'main', 'item');

    const div = el.querySelector('#my-div');

    div?.setAttribute('px-class', 'isRead:highlighted')

    if (div) {
      await elementUpdated(div);
    }

    expect(div?.className).toContain('highlighted');
  });
  
  it('should a different class name when attribute is changed', async () => {
    const el = await fixture(`<div><div><div px-class="isRead:highlighted" id="my-div"></div></div></div>`);
    
    observer = new ClassObserver(el, { isRead: true }, 'main', 'item');

    const div = el.querySelector('#my-div');

    div?.setAttribute('px-class', 'isRead:foo;isNew:highlighted')

    if (div) {
      await elementUpdated(div);
    }

    expect(div?.className).not.toContain('highlighted');
    expect(div?.className).toContain('foo');
  });
});