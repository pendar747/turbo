import { fixture } from '@open-wc/testing-helpers';
import './Render';

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
    expect(el.shadowRoot?.innerHTML).toEqual(`<!----><div id="container"><!----><!----><tb-render value="{'comment':'This post is terrible','name':'the criticizer','time':'03/05/2020'}" template="comment"><tb-template></tb-template></tb-render><!----><tb-render value="{'comment':'This post is awesome','name':'Good guy','time':'12/04/2020'}" template="comment"><tb-template></tb-template></tb-render><!----><tb-render value="{'comment':'So boring','name':'Mike','time':'27/03/2020'}" template="comment"><tb-template></tb-template></tb-render><!----><!----></div><!---->`);
  });
});