import { fixture, elementUpdated } from "@open-wc/testing-helpers";
import './Unless';
import { fire } from "../util";

describe('tb-unless', () => {

  it('should not render the slot when value is true', async () => {
    const el = await fixture(`<tb-unless value="true">My message</tb-unless>`);
    expect(el.shadowRoot?.querySelectorAll('slot')?.length).toEqual(0);
    
    const el2 = await fixture(`<tb-unless value="false">My message</tb-unless>`);
    expect(el2.shadowRoot?.querySelectorAll('slot')?.length).toEqual(1);
  });

  it('should not render the slot when value attribute changes to false', async() => {
    const el = await fixture(`<tb-unless value="true">My message</tb-unless>`);
    expect(el.shadowRoot?.querySelectorAll('slot')?.length).toEqual(0);

    el.setAttribute('value', 'false');
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelectorAll('slot')?.length).toEqual(1);
  });
  
  it('should treat truthy values as true', async() => {
    const el1 = await fixture(`<tb-unless value="1">My message</tb-unless>`);
    expect(el1.shadowRoot?.querySelectorAll('slot')?.length).toEqual(0);

    const el2 = await fixture(`<tb-unless value="'something'">My message</tb-unless>`);
    expect(el2.shadowRoot?.querySelectorAll('slot')?.length).toEqual(0);
    
    const el3 = await fixture(`<tb-unless value="{}">My message</tb-unless>`);
    expect(el3.shadowRoot?.querySelectorAll('slot')?.length).toEqual(0);
  });
  
  it('should treat falsy values as false', async() => {
    const el1 = await fixture(`<tb-unless value="0">My message</tb-unless>`);
    expect(el1.shadowRoot?.querySelectorAll('slot')?.length).toEqual(1);

    const el2 = await fixture(`<tb-unless value="''">My message</tb-unless>`);
    expect(el2.shadowRoot?.querySelectorAll('slot')?.length).toEqual(1);
    
    const el3 = await fixture(`<tb-unless value="null">My message</tb-unless>`);
    expect(el3.shadowRoot?.querySelectorAll('slot')?.length).toEqual(1);
  });

  it('should render the slot when model evaluates to a truthy value', async () => {
    localStorage.setItem('main', JSON.stringify({ name: 'Jim' }));
    const parentNode = await fixture('<div state="main"></div>')
    const el = await fixture(`<tb-unless model="name">My message</tb-unless>`, { parentNode });

    expect(el.shadowRoot?.querySelectorAll('slot')?.length).toEqual(0);
  });
  
  it('should not render the slot when model evaluates to a falsy value', async () => {
    localStorage.setItem('main', JSON.stringify({ name: undefined }));
    const parentNode = await fixture('<div state="main"></div>')
    const el = await fixture(`<tb-unless model="name">My message</tb-unless>`, { parentNode });
    
    expect(el.shadowRoot?.querySelectorAll('slot')?.length).toEqual(1);
  });
  
  it('should update the rendering when state changes', async () => {
    localStorage.setItem('main', JSON.stringify({ name: undefined }));
    const parentNode = await fixture('<div state="main"></div>')
    const el = await fixture(`<tb-unless model="name">My message</tb-unless>`, { parentNode });
    
    expect(el.shadowRoot?.querySelectorAll('slot')?.length).toEqual(1);

    fire('main-state-update', { name: 'Pete' });
    expect(el.shadowRoot?.querySelectorAll('slot')?.length).toEqual(0);
  });
});