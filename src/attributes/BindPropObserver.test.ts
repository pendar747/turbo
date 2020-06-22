import { fixture } from "@open-wc/testing-helpers";
import BindPropObserver from "./BindPropObserver";
import { on } from "../util";

describe('tb-bind-prop', () => {

  let observer: BindPropObserver;
  afterEach(() => {
    observer.disconnect();
  });

  it('should element properties based on the bindings', async () => {
    const el: HTMLInputElement = await fixture(`<input tb-bind-prop="name:value" type="text" />`);
    observer = new BindPropObserver(el, { name: 'Dan' }, 'main', 'item');

    expect(el.value).toEqual('Dan');
  });
  
  it('should update the prop when the model data changes', async () => {
    const el: HTMLInputElement = await fixture(`<input tb-bind-prop="name:value" type="text" />`);
    observer = new BindPropObserver(el, { name: 'Dan' }, 'main', 'item');

    observer.data = { name: 'James' };
    expect(el.value).toEqual('James');
  });
  
  it('should be able to apply multiple props', async () => {
    const el: HTMLInputElement = await fixture(`<input tb-bind-prop="name:value;defaultName:placeholder" type="text" />`);
    observer = new BindPropObserver(el, { name: 'Dan', defaultName: 'Asimov' }, 'main', 'item');

    expect(el.value).toEqual('Dan');
    expect(el.placeholder).toEqual('Asimov');
  });
  
  it('should apply props on nested elements when they are inserted', async () => {
    const parent = await fixture('<div></div>');
    observer = new BindPropObserver(parent, { name: 'Pete' }, 'main', 'item');

    const el: HTMLInputElement = await fixture('<input tb-bind-prop="name:value" />', { parentNode: parent });

    expect(el.value).toEqual('Pete');
  });
  
  it('should dispatch getters for the defined properties', async () => {
    const parent = await fixture('<div></div>');
    observer = new BindPropObserver(parent, { name: 'Pete' }, 'main', 'item');

    const eventHandler = jasmine.createSpy();
    on('main-add-getters', eventHandler);
    const el: HTMLInputElement = await fixture('<input tb-bind-prop="name:value;defaultName:placeholder" />', { parentNode: parent });

    expect(eventHandler.calls.argsFor(0)[0].detail).toEqual(['item.name', 'item.defaultName']);
  });
  
});