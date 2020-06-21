import { fixture } from "@open-wc/testing-helpers";
import BindPropObserver from "./BindPropObserver";

describe('tb-bind-prop', () => {

  let observer: BindPropObserver;
  afterEach(() => {
    observer.disconnect();
  });

  it('should element properties based on the bindings', async () => {
    const el: HTMLInputElement = await fixture(`<input tb-bind-prop="name:value" type="text" />`);
    observer = new BindPropObserver(el, { name: 'Dan' });

    expect(el.value).toEqual('Dan');
  });
  
  it('should update the prop when the model data changes', async () => {
    const el: HTMLInputElement = await fixture(`<input tb-bind-prop="name:value" type="text" />`);
    observer = new BindPropObserver(el, { name: 'Dan' });

    observer.data = { name: 'James' };
    expect(el.value).toEqual('James');
  });
  
  it('should be able to apply multiple props', async () => {
    const el: HTMLInputElement = await fixture(`<input tb-bind-prop="name:value;defaultName:placeholder" type="text" />`);
    observer = new BindPropObserver(el, { name: 'Dan', defaultName: 'Asimov' });

    expect(el.value).toEqual('Dan');
    expect(el.placeholder).toEqual('Asimov');
  });
  
  it('should apply props on nested elements when they are inserted', async () => {
    const parent = await fixture('<div></div>');
    observer = new BindPropObserver(parent, { name: 'Pete' });

    const el: HTMLInputElement = await fixture('<input tb-bind-prop="name:value" />', { parentNode: parent });

    expect(el.value).toEqual('Pete');
  });
})