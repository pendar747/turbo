import { fixture, elementUpdated } from "@open-wc/testing-helpers";
import './Switch';
import './Route';
import { fire } from "../util";

describe('tb-switch', () => {

  afterEach(() => {
    history.replaceState(null, 'home', '/');
  });

  it('should select the first route which matches the page path', async () => {

    const el = await fixture(`
      <tb-switch>
        <tb-route path="/about">
          <div>About page</div>
        </tb-route>
        <tb-route path="/">
          <div>Home Page</div>
        </tb-route>
      </tb-switch>
    `);


    history.pushState(null, 'home', '/');
    fire('page-change');
    
    await elementUpdated(el.querySelectorAll('tb-route')[0]);
    await elementUpdated(el.querySelectorAll('tb-route')[1]);

    expect(el.querySelectorAll('tb-route')[0].shadowRoot?.innerHTML).toEqual('<!----><!---->');
    expect(el.querySelectorAll('tb-route')[1].shadowRoot?.innerHTML).toEqual('<!----><slot></slot><!---->');
    
    history.pushState(null, 'home', '/about');
    fire('page-change');
    
    await elementUpdated(el.querySelectorAll('tb-route')[0]);
    await elementUpdated(el.querySelectorAll('tb-route')[1]);
    
    expect(el.querySelectorAll('tb-route')[0].shadowRoot?.innerHTML).toEqual('<!----><slot></slot><!---->');
    expect(el.querySelectorAll('tb-route')[1].shadowRoot?.innerHTML).toEqual('<!----><!---->');
  });

  it('should set the selected route when a new route is added', async () => {

    const el = await fixture(`
      <tb-switch>
        <tb-route path="/about">
          <div>About page</div>
        </tb-route>
        <tb-route path="/">
          <div>Home Page</div>
        </tb-route>
      </tb-switch>
    `);

    el.innerHTML = `
      <tb-route path="/info">
        <div>Info page</div>
      </tb-route>
    ` + el.innerHTML;

    history.pushState(null, 'info', '/info');
    fire('page-change');
    
    await elementUpdated(el.querySelectorAll('tb-route')[0]);
    await elementUpdated(el.querySelectorAll('tb-route')[1]);
    await elementUpdated(el.querySelectorAll('tb-route')[2]);

    expect(el.querySelectorAll('tb-route')[0].shadowRoot?.innerHTML).toEqual('<!----><slot></slot><!---->');
    expect(el.querySelectorAll('tb-route')[1].shadowRoot?.innerHTML).toEqual('<!----><!---->');
    expect(el.querySelectorAll('tb-route')[2].shadowRoot?.innerHTML).toEqual('<!----><!---->');
  });
});