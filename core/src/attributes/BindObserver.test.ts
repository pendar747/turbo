import { fixture } from "@open-wc/testing-helpers";
import BindObserver from "./BindObserver";
import { on } from "../util";

describe('px-bind', () => {

  let observer: BindObserver;
  afterEach(() => {
    observer.disconnect();
  });

  it('should set the values of the given attributes to the values defined in the model data', async () => {
    const el = await fixture(`<input px-bind="name:value" type="text" />`);
    observer = new BindObserver(el, { name: 'Dan' }, 'main', 'item');

    expect(el.getAttribute('value')).toEqual('Dan');
  });
  
  it('should update the attribute when the model data changes', async () => {
    const el = await fixture(`<input px-bind="name:value" type="text" />`);
    observer = new BindObserver(el, { name: 'Dan' }, 'main', 'item');

    observer.data = { name: 'James' };
    expect(el.getAttribute('value')).toEqual('James');
  });
  
  it('should be able to apply multiple attributes', async () => {
    const el = await fixture(`<input px-bind="name:value;defaultName:placeholder" type="text" />`);
    observer = new BindObserver(el, { name: 'Dan', defaultName: 'Asimov' }, 'main', 'item');

    expect(el.getAttribute('value')).toEqual('Dan');
    expect(el.getAttribute('placeholder')).toEqual('Asimov');
  });
  
  it('should omit attributes that are null or undefined or false', async () => {
    const el = await fixture(`<input px-bind="isSet:checked" type="checkbox" />`);
    observer = new BindObserver(el, { isSet: true }, 'main', 'item');

    expect(el.hasAttribute('checked')).toEqual(true);

    observer.data = { isSet: false };
    
    expect(el.hasAttribute('checked')).toEqual(false);
    
    observer.data = { isSet: undefined };
    
    expect(el.hasAttribute('checked')).toEqual(false);
    
    observer.data = { isSet: null };
    
    expect(el.hasAttribute('checked')).toEqual(false);
  });

  it('should apply attributes on nested elements when the are added', async () => {
    const parent = await fixture('<div></div>');
    observer = new BindObserver(parent, { name: 'Pete' }, 'main', 'item');

    const el = await fixture('<input px-bind="name:value" />', { parentNode: parent });

    expect(el.getAttribute('value')).toEqual('Pete');
  });
  
  it('should dispatch getters for the defined properties', async () => {
    const parent = await fixture('<div></div>');
    observer = new BindObserver(parent, { name: 'Pete' }, 'main', 'item');

    const eventHandler = jasmine.createSpy();
    on('main-add-getters', eventHandler);
    const el: HTMLInputElement = await fixture('<input px-bind="name:value;defaultName:placeholder" />', { parentNode: parent });

    expect(eventHandler.calls.argsFor(0)[0].detail).toEqual(['item.name', 'item.defaultName']);
  });
})