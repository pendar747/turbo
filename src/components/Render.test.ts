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
      sessionStorage.setItem('main', JSON.stringify({ profile: { name: 'Mike', city: 'New York' } }));
      await fixture('<template id="my-template">My name is {name} and I live in {city}.</template>')
      const parent = await fixture(`<div state="main"></div>`);
      el = await fixture(`<tb-render template="my-template" model="profile"></tb-render>`, { parentNode: parent });
    });
    
    it('should render the content', () => {
      expect(el.shadowRoot?.textContent).toEqual('My name is Mike and I live in New York.');
    });

    it('should dispatch an event that specifies the getters', () => {
      expect(eventHandler).toHaveBeenCalledTimes(2);
      expect(eventHandler.calls.argsFor(0)[0].detail).toEqual(['profile']);
      expect(eventHandler.calls.argsFor(1)[0].detail).toEqual(['profile.name', 'profile.city', 'profile']);
    });
  });
  
  it('should update when state changes', async () => {
    sessionStorage.setItem('main', JSON.stringify({ profile: { name: 'Mike', city: 'New York' } }));
    await fixture('<template id="my-template">My name is {name} and I live in {city}.</template>')
    const parent = await fixture(`<div state="main"></div>`);
    const el = await fixture(`<tb-render template="my-template" model="profile"></tb-render>`, { parentNode: parent });

    expect(el.shadowRoot?.textContent).toEqual('My name is Mike and I live in New York.');
    fire('main-state-update', { state: { profile: { name: 'Mike', city: 'Tokyo' } } });
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
      sessionStorage.setItem('list', JSON.stringify(state));
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

    it('should dispatch getters for each item and the model', () => {
      expect(eventHandler).toHaveBeenCalledTimes(5);
      expect(eventHandler.calls.argsFor(0)[0].detail).toEqual(['profiles']);
      expect(eventHandler.calls.argsFor(1)[0].detail).toEqual(['profiles[0].name', 'profiles[0].city', 'profiles[0]']);
      expect(eventHandler.calls.argsFor(2)[0].detail).toEqual(['profiles[1].name', 'profiles[1].city', 'profiles[1]']);
      expect(eventHandler.calls.argsFor(3)[0].detail).toEqual(['profiles[2].name', 'profiles[2].city', 'profiles[2]']);
      expect(eventHandler.calls.argsFor(4)[0].detail).toEqual(['profiles']);
    });
    
    it('should update the rendered list when an item in the list is updated', async () => {
      fire('list-state-update', {
        state: {
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
        }
      });
      
      expect(el.shadowRoot?.querySelector('tb-render:nth-of-type(2)')?.shadowRoot?.textContent)
        .toEqual('My name is Bumpzy and I live in Greenwich.');
    });
    
    it('should update the rendered list when an item removed', async () => {
      fire('list-state-update', {
        state: {
          profiles: [{
            name: 'Mike',
            city: 'New York'
          }, {
            name: 'Raj',
            city: 'Bangalore'
          }]
        }
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
      sessionStorage.setItem('list', JSON.stringify(newState));
      fire('list-state-update', { state: newState });

      await elementUpdated(el);
      
      expect(el.shadowRoot?.querySelectorAll('tb-render').length).toEqual(4);
      expect(el.shadowRoot?.querySelector('tb-render:last-of-type')?.shadowRoot?.textContent)
        .toEqual('My name is Emanuel and I live in Vienna.');
    });

  });

  
  it('should fire an event for the given model', async () => {
    sessionStorage.setItem('main', JSON.stringify({ profile: { name: 'Mike', city: 'New York' } }));
    await fixture('<template id="my-template"><button tb-action="click:click-me" id="my-button">click me</button></template>')
    const parent = await fixture(`<div state="main"></div>`);
    const el = await fixture(`<tb-render template="my-template" model="profile"></tb-render>`, { parentNode: parent });

    expect(el.shadowRoot?.innerHTML).toEqual('<!----><div id="container"><button tb-action="click:click-me" id="my-button">click me</button></div><!---->');

    const myEventCallback = jasmine.createSpy();
    on('main-action', myEventCallback);
    el.shadowRoot?.getElementById('my-button')?.dispatchEvent(new MouseEvent('click'));
    
    expect(myEventCallback.calls.count()).toEqual(1);
    expect(myEventCallback.calls.argsFor(0)[0].detail).toEqual({ 
      model: 'profile',
      actionName: 'click-me',
      data: {}
    });
  });

   
  it('should fire an event for a nested template', async () => {
    sessionStorage.setItem('main', JSON.stringify({ 
      profile: { 
        name: 'Mike', 
        city: {
          name: 'New York'
        } 
      } 
    }));
    await fixture('<template id="my-template"><button tb-action="click:click-me" id="my-button">click me</button></template>')
    await fixture('<template id="template-2"><tb-render model="city" template="my-template"></tb-render></template>')
    const parent = await fixture(`<div state="main"></div>`);
    const el = await fixture(`<tb-render template="template-2" model="profile"></tb-render>`, { parentNode: parent });

    const myEventCallback = jasmine.createSpy();
    on('main-action', myEventCallback);
    el.shadowRoot?.querySelector('tb-render')?.shadowRoot?.getElementById('my-button')?.dispatchEvent(new MouseEvent('click'));
    
    expect(myEventCallback.calls.count()).toEqual(1);
    expect(myEventCallback.calls.argsFor(0)[0].detail).toEqual({ 
      model: 'profile.city',
      actionName: 'click-me',
      data: {}
    });
  });
  
  it('should fire an event for the given model with the data that is attached to the element', async () => {
    sessionStorage.setItem('main', JSON.stringify({ profile: { name: 'Mike', city: 'New York' } }));
    await fixture('<template id="my-template"><button data-name="{name}" tb-action="click:click-me" id="my-button">click me</button></template>')
    const parent = await fixture(`<div state="main"></div>`);
    const el = await fixture(`<tb-render template="my-template" model="profile"></tb-render>`, { parentNode: parent });

    const myEventCallback = jasmine.createSpy();
    on('main-action', myEventCallback);
    el.shadowRoot?.getElementById('my-button')?.dispatchEvent(new MouseEvent('click'));
    
    expect(myEventCallback.calls.count()).toEqual(1);
    expect(myEventCallback.calls.argsFor(0)[0].detail).toEqual({ 
      model: 'profile', 
      data: {
        name: 'Mike',
      },
      actionName: 'click-me'
    });
  });
  
  it('should update the model and render with the fired event', async () => {
    sessionStorage.setItem('main', JSON.stringify({ profile: { name: 'Mike', city: 'New York' } }));
    await fixture('<template id="my-template"><span>{name}</span><input tb-action="keyup:setName" id="my-input" /></template>')
    const parent = await fixture(`<div state="main"></div>`);
    const el = await fixture(`<tb-render template="my-template" model="profile"></tb-render>`, { parentNode: parent });
    on('main-action', (event) => {
      const newState = {
        profile: {
          name: event.detail.data.value,
          city: 'New York'
        }
      }
      sessionStorage.setItem('main', JSON.stringify(newState));
      fire('main-state-update', { state: newState });
    });
    (el.shadowRoot?.getElementById('my-input') as HTMLInputElement).value = 'David';
    el.shadowRoot?.getElementById('my-input')?.dispatchEvent(new KeyboardEvent('keyup'));

    await elementUpdated(el);
    
    expect(el.shadowRoot?.innerHTML).toEqual('<!----><div id="container"><span>David</span><input tb-action="keyup:setName" id="my-input"></div><!---->');
  });

  it('should render with context', async () => {
    sessionStorage.setItem('main', JSON.stringify(
      { 
        profile: { 
          name: 'Mike', city: 'New York',
          friends: [{
            name: 'Steve',
            city: 'Berlin'
          }, {
            name: 'James',
            city: 'London'
          }]
        },
      }
    ));
    await fixture('<template id="my-template"><span>{name} lives in {city}</span></template>')
    const parent = await fixture(`<div state="main"></div>`);
    const el = await fixture(`<tb-render context="profile" template="my-template" model="friends"></tb-render>`, { parentNode: parent });

    expect(el.shadowRoot?.querySelectorAll('tb-render').length).toEqual(2);
    expect(el.shadowRoot?.querySelector('tb-render:nth-of-type(1)')?.shadowRoot?.textContent)
      .toEqual('Steve lives in Berlin');
    expect(el.shadowRoot?.querySelector('tb-render:nth-of-type(2)')?.shadowRoot?.textContent)
      .toEqual('James lives in London');
  });

  
  it('should render nested templates', async () => {
    sessionStorage.setItem('main', JSON.stringify(
      { 
        profile: { 
          name: 'Mike', city: 'New York',
          friends: [{
            name: 'Steve',
            city: 'Berlin'
          }, {
            name: 'James',
            city: 'London'
          }]
        },
      }
    ));
    await fixture(`<template id="my-template">
      <span>{name} lives in {city}</span>
      <div>
        <h2>friends</h2>
        <tb-render template="my-template" model="friends"></tb-render>
      </div>
    </template>`)
    const parent = await fixture(`<div state="main"></div>`);
    const el = await fixture(`<tb-render template="my-template" model="profile"></tb-render>`, { parentNode: parent });

    const nestedRender = el.shadowRoot?.querySelector('tb-render');

    expect(nestedRender?.shadowRoot?.querySelectorAll('tb-render').length).toEqual(2);
    expect(nestedRender?.shadowRoot?.querySelector('tb-render:nth-of-type(1)')?.shadowRoot?.textContent)
      .toContain('Steve lives in Berlin');
    expect(nestedRender?.shadowRoot?.querySelector('tb-render:nth-of-type(2)')?.shadowRoot?.textContent)
      .toContain('James lives in London');
  });
   
  it('should inherit the model from parent template when model is not provided', async () => {
    sessionStorage.setItem('main', JSON.stringify(
      { 
        profile: { 
          name: 'Mike', 
          city: 'New York',
          justMovedToCity: true,
          friends: [{
            name: 'Steve',
            city: 'Berlin'
          }, {
            name: 'James',
            city: 'London'
          }]
        },
      }
    ));
    await fixture(`<template id="nested">{name} just moved to this city!</template>`)
    await fixture(`<template id="my-template">
      <span>{name} lives in {city}</span>
      <tb-render if="justMovedToCity" template="nested"></tb-render>
    </template>`)
    const parent = await fixture(`<div state="main"></div>`);
    const el = await fixture(`<tb-render template="my-template" model="profile"></tb-render>`, { parentNode: parent });

    const nestedRender = el.shadowRoot?.querySelector('tb-render');

    expect(nestedRender?.shadowRoot?.innerHTML)
      .toContain('Mike just moved to this city!');
  });
  
  it('should render nested list templates', async () => {
    sessionStorage.setItem('main', JSON.stringify(
      { 
        profile: [{ 
          name: 'Mike',
          city: {
            name: 'London',
            population: 10000000
          }
        }, {
          name: 'Jim',
          city: {
            name: 'New York',
            population: 18000000
          }
        }],
      }
    ));
    await fixture('<template id="city">{name} has a population of {population} people.</template>');
    await fixture(`<template id="my-template">
      <span>My name is {name}</span>
      <tb-render template="city" model="city"></tb-render>
    </template>`)
    const parent = await fixture(`<div state="main"></div>`);
    const el = await fixture(`<tb-render template="my-template" model="profile"></tb-render>`, { parentNode: parent });

    expect(el.shadowRoot?.querySelector('tb-render:nth-of-type(1)')
      ?.shadowRoot?.querySelector('tb-render')?.shadowRoot?.textContent).toEqual('London has a population of 10000000 people.');
    expect(el.shadowRoot?.querySelector('tb-render:nth-of-type(2)')
      ?.shadowRoot?.querySelector('tb-render')?.shadowRoot?.textContent).toEqual('New York has a population of 18000000 people.');
  });

   
  it('should render without context when no-context attribute is added', async () => {
    sessionStorage.setItem('main', JSON.stringify(
      { 
        mainCity: {
          name: 'Los Angeles',
          population: 10
        },
        profile: [{ 
          name: 'Mike',
          city: {
            name: 'London',
            population: 10000000
          }
        }, {
          name: 'Jim',
          city: {
            name: 'New York',
            population: 18000000
          }
        }],
      }
    ));
    await fixture('<template id="city">{name} has a population of {population} people.</template>');
    await fixture(`<template id="my-template">
      <span>My name is {name}</span>
      <tb-render template="city" no-context model="mainCity"></tb-render>
    </template>`)
    const parent = await fixture(`<div state="main"></div>`);
    const el = await fixture(`<tb-render template="my-template" model="profile"></tb-render>`, { parentNode: parent });

    expect(el.shadowRoot?.querySelector('tb-render:nth-of-type(1)')
      ?.shadowRoot?.querySelector('tb-render')?.shadowRoot?.textContent).toEqual('Los Angeles has a population of 10 people.');
    expect(el.shadowRoot?.querySelector('tb-render:nth-of-type(2)')
      ?.shadowRoot?.querySelector('tb-render')?.shadowRoot?.textContent).toEqual('Los Angeles has a population of 10 people.');
  });

  it('should assign classes with tb-class when a condition is true', async () => {
    sessionStorage.setItem('main', JSON.stringify({
      task: {
        isDone: false,
        isNew: true,
        task: 'Buy milk'
      }
    }));
    await fixture(`<template id="my-template">
      <style>
        .new-task {
          background-color: red;
        }
        .border {
          border: 1px solid black;
        }
        .green {
          color: green;
        }
      </style>
      <div id="my-div" tb-class="isDone:green,border;isNew:new-task">{task}</div>
    </template>`)
    const parent = await fixture(`<div state="main"></div>`);
    const el = await fixture(`<tb-render template="my-template" model="task"></tb-render>`, { parentNode: parent });    

    const div = el.shadowRoot?.querySelector('#my-div');
    if (div) {
      await elementUpdated(div);
    }

    expect(div?.className).toContain('new-task');
    expect(div?.className).not.toContain('green');
    expect(div?.className).not.toContain('border');
    
    fire('main-state-update', {
      state: {
        task: {
          isDone: true,
          isNew: false,
          task: 'Buy milk'
        }
      }
    });
    
    if (div) {
      await elementUpdated(div);
    }
    
    expect(div?.className).not.toContain('new-task');
    expect(div?.className).toContain('green');
    expect(div?.className).toContain('border');
  });
  
 
  it('should assign attributes to elements that have the tb-bind attribute', async () => {
    sessionStorage.setItem('main', JSON.stringify({
      profile: {
        name: 'steve'
      }
    }));
    await fixture(`<template id="my-template">
      <input tb-bind="name:value" type="text"/>
    </template>`)
    const parent = await fixture(`<div state="main"></div>`);
    const el = await fixture(`<tb-render template="my-template" model="profile"></tb-render>`, { parentNode: parent });    

    const input = el.shadowRoot?.querySelector('input');
    if (input) {
      await elementUpdated(input);
    }

    expect(input?.getAttribute('value')).toContain('steve');
    
    fire('main-state-update', {
      state: {
        profile: {
          name: 'James'
        }
      }
    });
    
    if (input) {
      await elementUpdated(input);
    }
    
    expect(input?.getAttribute('value')).toContain('James');
  }); 
});