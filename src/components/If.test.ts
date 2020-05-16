import { fixture, elementUpdated } from "@open-wc/testing-helpers";
import './If';
import { fire } from "../util";

describe('tb-if', () => {

  it('should render the slot when value is true', async () => {
    const el = await fixture(`<tb-if value="true">My message</tb-if>`);
    expect(el.shadowRoot?.querySelectorAll('slot')?.length).toEqual(1);
    
    const el2 = await fixture(`<tb-if value="false">My message</tb-if>`);
    expect(el2.shadowRoot?.querySelectorAll('slot')?.length).toEqual(0);
  });

  it('should not render the slot when value attribute changes to false', async() => {
    const el = await fixture(`<tb-if value="true">My message</tb-if>`);
    expect(el.shadowRoot?.querySelectorAll('slot')?.length).toEqual(1);

    el.setAttribute('value', 'false');
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelectorAll('slot')?.length).toEqual(0);
  });
  
  it('should treat truthy values as true', async() => {
    const el1 = await fixture(`<tb-if value="1">My message</tb-if>`);
    expect(el1.shadowRoot?.querySelectorAll('slot')?.length).toEqual(1);

    const el2 = await fixture(`<tb-if value="'something'">My message</tb-if>`);
    expect(el2.shadowRoot?.querySelectorAll('slot')?.length).toEqual(1);
    
    const el3 = await fixture(`<tb-if value="{}">My message</tb-if>`);
    expect(el3.shadowRoot?.querySelectorAll('slot')?.length).toEqual(1);
  });
  
  it('should treat falsy values as false', async() => {
    const el1 = await fixture(`<tb-if value="0">My message</tb-if>`);
    expect(el1.shadowRoot?.querySelectorAll('slot')?.length).toEqual(0);

    const el2 = await fixture(`<tb-if value="''">My message</tb-if>`);
    expect(el2.shadowRoot?.querySelectorAll('slot')?.length).toEqual(0);
    
    const el3 = await fixture(`<tb-if value="null">My message</tb-if>`);
    expect(el3.shadowRoot?.querySelectorAll('slot')?.length).toEqual(0);
  });

  it('should render the slot when model evaluates to a truthy value', async () => {
    localStorage.setItem('main', JSON.stringify({ name: 'Jim' }));
    const parentNode = await fixture('<div state="main"></div>')
    const el = await fixture(`<tb-if model="name">My message</tb-if>`, { parentNode });

    expect(el.shadowRoot?.querySelectorAll('slot')?.length).toEqual(1);
  });
  
  it('should not render the slot when model evaluates to a falsy value', async () => {
    localStorage.setItem('main', JSON.stringify({ name: undefined }));
    const parentNode = await fixture('<div state="main"></div>')
    const el = await fixture(`<tb-if model="name">My message</tb-if>`, { parentNode });
    
    expect(el.shadowRoot?.querySelectorAll('slot')?.length).toEqual(0);
  });
  
  it('should update the rendering when state changes', async () => {
    localStorage.setItem('main', JSON.stringify({ name: undefined }));
    const parentNode = await fixture('<div state="main"></div>')
    const el = await fixture(`<tb-if model="name">My message</tb-if>`, { parentNode });
    
    expect(el.shadowRoot?.querySelectorAll('slot')?.length).toEqual(0);

    fire('main-state-update', { name: 'Pete' });
    expect(el.shadowRoot?.querySelectorAll('slot')?.length).toEqual(1);
  });
});