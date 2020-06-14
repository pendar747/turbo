import { fixture, elementUpdated } from "@open-wc/testing-helpers";
import './Unless';
import { fire } from "../util";

describe('tb-unless', () => {
  it('should render the slot when model evaluates to a truthy value', async () => {
    sessionStorage.setItem('main', JSON.stringify({ name: 'Jim' }));
    const parentNode = await fixture('<div state="main"></div>')
    const el = await fixture(`<tb-unless model="name">My message</tb-unless>`, { parentNode });

    expect(el.shadowRoot?.querySelectorAll('slot')?.length).toEqual(0);
  });
  
  it('should not render the slot when model evaluates to a falsy value', async () => {
    sessionStorage.setItem('main', JSON.stringify({ name: undefined }));
    const parentNode = await fixture('<div state="main"></div>')
    const el = await fixture(`<tb-unless model="name">My message</tb-unless>`, { parentNode });
    
    expect(el.shadowRoot?.querySelectorAll('slot')?.length).toEqual(1);
  });
  
  it('should update the rendering when state changes', async () => {
    sessionStorage.setItem('main', JSON.stringify({ name: undefined }));
    const parentNode = await fixture('<div state="main"></div>')
    const el = await fixture(`<tb-unless model="name">My message</tb-unless>`, { parentNode });
    
    expect(el.shadowRoot?.querySelectorAll('slot')?.length).toEqual(1);

    fire('main-state-update', { name: 'Pete' });
    expect(el.shadowRoot?.querySelectorAll('slot')?.length).toEqual(0);
  });
});