import { fixture, waitUntil, elementUpdated } from '@open-wc/testing-helpers';
import './Render';
import { fire } from '../util';

describe('Render', () => {

  it('should render the given content', async () => {
    await fixture('<template id="my-template">My name is {name} and I live in {city}.</template>')
    const el = await fixture(`
      <tb-render template="my-template" value="{'name':'John', 'city': 'New York'}"></tb-render>
    `);
    expect(el.shadowRoot?.textContent).toEqual('My name is John and I live in New York.');
  });

  it('should omit a property if its not defined', async () => {
    await fixture('<template id="my-template">My name is {name} and I live in {city}.</template>')
    const el = await fixture(`
      <tb-render template="my-template" value="{'name':'John'}"></tb-render>
    `);
    expect(el.shadowRoot?.textContent).toEqual('My name is John and I live in .');
  });

  it('should render a nested template', async () => {
    await fixture(`<template id="my-template"><p>My name is {name} and I live in {city}. </p>And my friend: <tb-render value="{friend}" template="my-template"></tb-render></template>`);
    const el = await fixture(`
      <tb-render template="my-template" value="{'name':'John', 'city': 'New York', 'friend': { 'name': 'Mike', 'city': 'Boston'}}"></tb-render>
    `);
    expect(el.shadowRoot?.querySelector('tb-render')?.shadowRoot?.textContent)
      .toEqual(`My name is Mike and I live in Boston. And my friend: `);
  });

  it('should repeat the template for each item in the list if value is an array', async () => {
    await fixture(`<template id="comment"><p>{comment} by {name} at {time}</p></template`);
    const value = `[
      { 'comment': 'This post is terrible', 'name': 'the criticizer', 'time': '03/05/2020' },
      { 'comment': 'This post is awesome', 'name': 'Good guy', 'time': '12/04/2020' },
      { 'comment': 'So boring', 'name': 'Mike', 'time': '27/03/2020' }
    ]`;
    const el = await fixture(`<tb-render template="comment" value="${value}"><tb-render>`);
    expect(el.shadowRoot?.querySelectorAll('tb-render').length).toEqual(3);
    expect(el.shadowRoot?.querySelector('tb-render:nth-of-type(1)')?.shadowRoot?.textContent).toEqual('This post is terrible by the criticizer at 03/05/2020');
    expect(el.shadowRoot?.querySelector('tb-render:nth-of-type(2)')?.shadowRoot?.textContent).toEqual('This post is awesome by Good guy at 12/04/2020');
    expect(el.shadowRoot?.querySelector('tb-render:nth-of-type(3)')?.shadowRoot?.textContent).toEqual('So boring by Mike at 27/03/2020');
  });

  it('should work with a model in state', async () => {
    localStorage.setItem('main', JSON.stringify({ profile: { name: 'Mike', city: 'New York' } }));
    await fixture('<template id="my-template">My name is {name} and I live in {city}.</template>')
    const parent = await fixture(`<div state="main"></div>`);
    const el = await fixture(`<tb-render template="my-template" model="profile"></tb-render>`, { parentNode: parent });

    expect(el.shadowRoot?.textContent).toEqual('My name is Mike and I live in New York.');
  });

  it('should update when state changes', async () => {
    localStorage.setItem('main', JSON.stringify({ profile: { name: 'Mike', city: 'New York' } }));
    await fixture('<template id="my-template">My name is {name} and I live in {city}.</template>')
    const parent = await fixture(`<div state="main"></div>`);
    const el = await fixture(`<tb-render template="my-template" model="profile"></tb-render>`, { parentNode: parent });

    expect(el.shadowRoot?.textContent).toEqual('My name is Mike and I live in New York.');
    fire('main-state-update', { state: { profile: { name: 'Mike', city: 'Tokyo' } } });
    expect(el.shadowRoot?.textContent).toEqual('My name is Mike and I live in Tokyo.');
  });

  it('should render a list when the model is an array', async () => {
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
    const el = await fixture(`<tb-render template="my-template" model="profiles"></tb-render>`, { parentNode: parent });

    expect(el.shadowRoot?.querySelectorAll('tb-render').length).toEqual(3);
    expect(el.shadowRoot?.querySelector('tb-render:nth-of-type(1)')?.shadowRoot?.textContent)
      .toEqual('My name is Mike and I live in New York.');
    expect(el.shadowRoot?.querySelector('tb-render:nth-of-type(2)')?.shadowRoot?.textContent)
      .toEqual('My name is Jimmy and I live in Boston.');
    expect(el.shadowRoot?.querySelector('tb-render:nth-of-type(3)')?.shadowRoot?.textContent)
      .toEqual('My name is Raj and I live in Bangalore.');
  });

  it('should update the rendered list when the model updates', async () => {
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
    const el = await fixture(`<tb-render template="my-template" model="profiles"></tb-render>`, { parentNode: parent });

    expect(el.shadowRoot?.querySelector('tb-render:nth-of-type(2)')?.shadowRoot?.textContent)
      .toEqual('My name is Jimmy and I live in Boston.');

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
});