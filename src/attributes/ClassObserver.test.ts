import { fixture, elementUpdated } from "@open-wc/testing-helpers";
import ClassObserver from "./ClassObserver";

describe('tb-class attribute', () => {

  it('should add classes defined in condition:my-class to the element when the condition is true', async () => {
    const el = await fixture(`<div tb-class="isRead:highlighted"></div>`);

    new ClassObserver(el, { isRead: true });

    expect(el.className).toContain('highlighted');
  });
  
  it('should apply multiple classes for a condition', async () => {
    const el = await fixture(`<div tb-class="isRead:highlighted,border"></div>`);

    new ClassObserver(el, { isRead: true });

    expect(el.className).toContain('highlighted');
    expect(el.className).toContain('border');
  });
  
  it('should add apply multiple conditions', async () => {
    const el = await fixture(`<div tb-class="isRead:highlighted;isNew:red"></div>`);

    new ClassObserver(el, { isRead: true, isNew: true });

    expect(el.className).toContain('highlighted');
    expect(el.className).toContain('red');
  });
  
  it('should reapply the classes when data changes', async () => {
    const el = await fixture(`<div tb-class="isRead:highlighted;isNew:red"></div>`);

    const observer = new ClassObserver(el, { isRead: true, isNew: true });

    expect(el.className).toContain('highlighted');
    expect(el.className).toContain('red');

    observer.data = { isRead: false, isNew: true };

    expect(el.className).not.toContain('highlighted');
    expect(el.className).toContain('red');
  });
  
  it('should apply classnames when element is nested in target node', async () => {
    const el = await fixture(`<div><div><div id="my-div" tb-class="isRead:highlighted"></div></div></div>`);

    new ClassObserver(el, { isRead: true });

    expect(el.querySelector('#my-div')?.className).toContain('highlighted');
  });
  
  it('should apply classnames when element is added later', async () => {
    const parent = await fixture(`<div></div>`);
    
    new ClassObserver(parent, { isRead: true });

    const el = await fixture('<div id="my-div" tb-class="isRead:highlighted"></div>', { parentNode: parent });

    expect(el.className).toContain('highlighted');
  });
  
  it('should apply classnames when element is added later nested inside another element', async () => {
    const parent = await fixture(`<div></div>`);
    
    new ClassObserver(parent, { isRead: true });

    const el = await fixture('<div><div id="my-div" tb-class="isRead:highlighted"></div></div>', { parentNode: parent });

    expect(el.querySelector('#my-div')?.className).toContain('highlighted');
  });
  
  it('should apply classnames when attribute is set later', async () => {
    const el = await fixture(`<div><div><div id="my-div"></div></div></div>`);
    
    new ClassObserver(el, { isRead: true });

    const div = el.querySelector('#my-div');

    div?.setAttribute('tb-class', 'isRead:highlighted')

    if (div) {
      await elementUpdated(div);
    }

    expect(div?.className).toContain('highlighted');
  });
  
  it('should a different class name when attribute is changed', async () => {
    const el = await fixture(`<div><div><div tb-class="isRead:highlighted" id="my-div"></div></div></div>`);
    
    new ClassObserver(el, { isRead: true });

    const div = el.querySelector('#my-div');

    div?.setAttribute('tb-class', 'isRead:foo;isNew:highlighted')

    if (div) {
      await elementUpdated(div);
    }

    expect(div?.className).not.toContain('highlighted');
    expect(div?.className).toContain('foo');
  });
});