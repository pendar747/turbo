import { fixture, elementUpdated } from '@open-wc/testing-helpers';
import './Render';
import { fire, on } from '../util';

describe('Render', () => {

  describe('rendering a model', async () => {
    let el: HTMLElement;
    let eventHandler: jasmine.Spy;
    beforeAll( async () => {
      eventHandler = jasmine.createSpy();
      on('main-add-getters', eventHandler);
      localStorage.setItem('main', JSON.stringify({ profile: { name: 'Mike', city: 'New York' } }));
      await fixture('<template id="my-template">My name is {name} and I live in {city}.</template>')
      const parent = await fixture(`<div state="main"></div>`);
      el = await fixture(`<tb-render template="my-template" model="profile"></tb-render>`, { parentNode: parent });
    });
    
    it('should render the content', () => {
      expect(el.shadowRoot?.textContent).toEqual('My name is Mike and I live in New York.');
    });

    it('should dispatch an event that specifies the getters', () => {
      expect(eventHandler).toHaveBeenCalledTimes(1);
      expect(eventHandler.calls.argsFor(0)[0].detail).toEqual({
        model: 'profile',
        getters: ['name', 'city']
      });
    });
  });
  
  it('should update when state changes', async () => {
    localStorage.setItem('main', JSON.stringify({ profile: { name: 'Mike', city: 'New York' } }));
    await fixture('<template id="my-template">My name is {name} and I live in {city}.</template>')
    const parent = await fixture(`<div state="main"></div>`);
    const el = await fixture(`<tb-render template="my-template" model="profile"></tb-render>`, { parentNode: parent });

    expect(el.shadowRoot?.textContent).toEqual('My name is Mike and I live in New York.');
    fire('main-state-update', { profile: { name: 'Mike', city: 'Tokyo' } });
    expect(el.shadowRoot?.textContent).toEqual('My name is Mike and I live in Tokyo.');
  });

  describe('rendering lists', () => {
    let el: HTMLElement;
    let eventHandler: jasmine.Spy;
    beforeEach(async () => {
      eventHandler = jasmine.createSpy();
      on('list-add-getters', eventHandler);
      const state = {
        profiles: [{
          name: 'Mike',
          city: 'New York'
        }, {
          name: 'Jimmy',
          city: 'Boston'
        }, {
          name: 'Raj',
          city: 'Bangalore'
        }]
      };
      localStorage.setItem('list', JSON.stringify(state));
      await fixture('<template id="my-template">My name is {name} and I live in {city}.</template>')
      const parent = await fixture(`<div state="list"></div>`);
      el = await fixture(`<tb-render template="my-template" model="profiles"></tb-render>`, { parentNode: parent });
    });
    
    it('should render a list when the model is an array', async () => {
      expect(el.shadowRoot?.querySelectorAll('tb-render').length).toEqual(3);
      expect(el.shadowRoot?.querySelector('tb-render:nth-of-type(1)')?.shadowRoot?.textContent)
        .toEqual('My name is Mike and I live in New York.');
      expect(el.shadowRoot?.querySelector('tb-render:nth-of-type(2)')?.shadowRoot?.textContent)
        .toEqual('My name is Jimmy and I live in Boston.');
      expect(el.shadowRoot?.querySelector('tb-render:nth-of-type(3)')?.shadowRoot?.textContent)
        .toEqual('My name is Raj and I live in Bangalore.');
    });

    it('should dispatch getters for each item', () => {
      expect(eventHandler).toHaveBeenCalledTimes(3);
      expect(eventHandler.calls.argsFor(0)[0].detail).toEqual({
        model: 'profiles[0]',
        getters: ['name', 'city']
      });
      expect(eventHandler.calls.argsFor(1)[0].detail).toEqual({
        model: 'profiles[1]',
        getters: ['name', 'city']
      });
      expect(eventHandler.calls.argsFor(2)[0].detail).toEqual({
        model: 'profiles[2]',
        getters: ['name', 'city']
      });
    });
    
    it('should update the rendered list when an item in the list is updated', async () => {
      fire('list-state-update', {
        profiles: [{
          name: 'Mike',
          city: 'New York'
        }, {
          name: 'Bumpzy',
          city: 'Greenwich'
        }, {
          name: 'Raj',
          city: 'Bangalore'
        }]
      });
      
      expect(el.shadowRoot?.querySelector('tb-render:nth-of-type(2)')?.shadowRoot?.textContent)
        .toEqual('My name is Bumpzy and I live in Greenwich.');
    });
    
    it('should update the rendered list when an item removed', async () => {
      fire('list-state-update', {
        profiles: [{
          name: 'Mike',
          city: 'New York'
        }, {
          name: 'Raj',
          city: 'Bangalore'
        }]
      });
      
      expect(el.shadowRoot?.querySelectorAll('tb-render').length).toEqual(2);
      expect(el.shadowRoot?.querySelector('tb-render:nth-of-type(2)')?.shadowRoot?.textContent)
        .toEqual('My name is Raj and I live in Bangalore.');
    });
    
    it('should update the rendered list when an item added', async () => {
      const newState = {
        profiles: [{
          name: 'Mike',
          city: 'New York'
        }, {
          name: 'Jimmy',
          city: 'Boston'
        }, {
          name: 'Raj',
          city: 'Bangalore'
        }, {
          name: 'Emanuel',
          city: 'Vienna'
        }]
      };
      localStorage.setItem('list', JSON.stringify(newState));
      fire('list-state-update', newState);

      await elementUpdated(el);
      
      expect(el.shadowRoot?.querySelectorAll('tb-render').length).toEqual(4);
      expect(el.shadowRoot?.querySelector('tb-render:last-of-type')?.shadowRoot?.textContent)
        .toEqual('My name is Emanuel and I live in Vienna.');
    });

  });

  
  it('should fire an event for the given model', async () => {
    localStorage.setItem('main', JSON.stringify({ profile: { name: 'Mike', city: 'New York' } }));
    await fixture('<template id="my-template"><button tb-action="click:click-me" id="my-button">click me</button></template>')
    const parent = await fixture(`<div state="main"></div>`);
    const el = await fixture(`<tb-render template="my-template" model="profile"></tb-render>`, { parentNode: parent });

    expect(el.shadowRoot?.innerHTML).toEqual('<!----><div id="container"><button tb-action="click:click-me" id="my-button">click me</button></div><!---->');

    const myEventCallback = jasmine.createSpy();
    on('click-me', myEventCallback);
    el.shadowRoot?.getElementById('my-button')?.dispatchEvent(new MouseEvent('click'));
    
    expect(myEventCallback.calls.count()).toEqual(1);
    expect(myEventCallback.calls.argsFor(0)[0]).toBeInstanceOf(CustomEvent);
    expect(myEventCallback.calls.argsFor(0)[0].detail).toEqual({ model: 'profile' });
  });
  
  it('should fire an event for the given model with the data that is attached to the element', async () => {
    localStorage.setItem('main', JSON.stringify({ profile: { name: 'Mike', city: 'New York' } }));
    await fixture('<template id="my-template"><button data-name="{name}" tb-action="click:click-me" id="my-button">click me</button></template>')
    const parent = await fixture(`<div state="main"></div>`);
    const el = await fixture(`<tb-render template="my-template" model="profile"></tb-render>`, { parentNode: parent });

    const myEventCallback = jasmine.createSpy();
    on('click-me', myEventCallback);
    el.shadowRoot?.getElementById('my-button')?.dispatchEvent(new MouseEvent('click'));
    
    expect(myEventCallback.calls.count()).toEqual(1);
    expect(myEventCallback.calls.argsFor(0)[0]).toBeInstanceOf(CustomEvent);
    expect(myEventCallback.calls.argsFor(0)[0].detail).toEqual({ model: 'profile', name: 'Mike' });
  });
  
  it('should update the model and render with the fired event', async () => {
    localStorage.setItem('main', JSON.stringify({ profile: { name: 'Mike', city: 'New York' } }));
    await fixture('<template id="my-template"><span>{name}</span><input tb-action="keyup:setName" id="my-input" /></template>')
    const parent = await fixture(`<div state="main"></div>`);
    const el = await fixture(`<tb-render template="my-template" model="profile"></tb-render>`, { parentNode: parent });
    on('setName', (event) => {
      const newState = {
        profile: {
          name: event.detail.value,
          city: 'New York'
        }
      }
      localStorage.setItem('list', JSON.stringify(newState));
      fire('main-state-update', newState);
    });
    (el.shadowRoot?.getElementById('my-input') as HTMLInputElement).value = 'David';
    el.shadowRoot?.getElementById('my-input')?.dispatchEvent(new KeyboardEvent('keyup'));

    await elementUpdated(el);
    
    expect(el.shadowRoot?.innerHTML).toEqual('<!----><div id="container"><span>David</span><input tb-action="keyup:setName" id="my-input"></div><!---->');
  });
});