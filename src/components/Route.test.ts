import Route from './Route';
import { fixture, elementUpdated } from '@open-wc/testing-helpers';
import { on, fire } from '../util';

describe('tb-route', () => {

  describe('isMatching', () => {
    
    it('should return true if the route path matches the current page path', async () => {
      const el: Route = await fixture(`<tb-route path="/user/:id"></tb-route>`);

      history.pushState(null, 'user profile', '/user/2');
      expect(el instanceof Route).toEqual(true);
      expect(el.isMatching()).toEqual(true);
    });
    
    it('should return false if the route path does not matches the current page path', async () => {
      const el: Route = await fixture(`<tb-route path="/user/:id"></tb-route>`);
      history.pushState(null, 'user profile', '/looser/2');
      expect(el.isMatching()).toEqual(false);
    });

  });

  describe('setSelected', () => {

    it('should render the slot when selected and matches the current page path', async () => {
      const el: Route = await fixture(`<tb-route path="/user/:id"><p>user profile</p></tb-route>`);
      history.pushState(null, 'user profile', '/user/2');
      el.setSelected(true);

      await elementUpdated(el);

      expect(el.shadowRoot?.innerHTML).toEqual('<!----><slot></slot><!---->');
    });
    
    it('fire the given action with the path parameters when selected', async () => {
      const parent = await fixture('<div state="main"></div>');
      const handler = jasmine.createSpy();
      on('main-action', handler);
      const el: Route = await fixture(`<tb-route action="myAction" path="/user/:id/post/:postId"><p>user profile</p></tb-route>`, { parentNode: parent });
      history.pushState(null, 'user profile', '/user/2/post/4');
      el.setSelected(true);

      expect(handler).toHaveBeenCalled();
      expect((handler.calls.argsFor(0)[0] as CustomEvent).detail)
        .toEqual({ 
          data: { params: { id: '2', postId: '4' }},
          actionName: 'myAction',
          model: ''
        });
    });
    
    it('should render empty when selected is set to false', async () => {
      const el: Route = await fixture(`<tb-route path="/user/:id"><p>user profile</p></tb-route>`);
      history.pushState(null, 'user profile', '/looser/2');
      el.setSelected(false);

      await elementUpdated(el);

      expect(el.shadowRoot?.innerHTML).toEqual('<!----><!---->');
    });

  });

  it('should fire the function again when context or model changes and route is selected', async () => {
    const parent = await fixture('<div state="main"></div>');
    const handler = jasmine.createSpy();
    on('main-action', handler);
    const el: Route = await fixture(`<tb-route action="myAction" path="/user/:id/post/:postId"><p>user profile</p></tb-route>`, { parentNode: parent });
    history.pushState(null, 'user profile', '/user/2/post/4');
    el.setSelected(true);

    el.setAttribute('model', 'list');

    await elementUpdated(el);

    el.setAttribute('context', 'myApp');

    await elementUpdated(el);

    expect(handler).toHaveBeenCalledTimes(3);
    expect((handler.calls.argsFor(0)[0] as CustomEvent).detail)
      .toEqual({ 
        data: { params: { id: '2', postId: '4' }},
        actionName: 'myAction',
        model: ''
      });
    expect((handler.calls.argsFor(1)[0] as CustomEvent).detail)
      .toEqual({ 
        data: { params: { id: '2', postId: '4' }},
        actionName: 'myAction',
        model: 'list'
      });
    expect((handler.calls.argsFor(2)[0] as CustomEvent).detail)
      .toEqual({ 
        data: { params: { id: '2', postId: '4' }},
        actionName: 'myAction',
        model: 'myApp.list'
      });
  });

  describe('getters', () => {

    it('should dispatch the full model path as getters when connected', async () => {
      const handler = jasmine.createSpy();
      on('myApp-add-getters', handler);
      const parentNode = await fixture('<div state="myApp"></div>');
      const el: Route = await fixture(`<tb-route context="list" model="item" path="/user/:id"></tb-route>`, { parentNode });

      expect(handler).toHaveBeenCalledTimes(3);
      expect(handler.calls.argsFor(2)[0].detail).toEqual(['list.item']);
    });
    

    it('should dispatch getters when model or context change', async () => {
      const parentNode = await fixture('<div state="myApp"></div>');
      const el: Route = await fixture(`<tb-route context="list" model="item" path="/user/:id"></tb-route>`, { parentNode });
      
      const handler = jasmine.createSpy();
      on('myApp-add-getters', handler);

      el.setAttribute('model', 'item2');
      await elementUpdated(el);

      expect(handler.calls.argsFor(0)[0].detail).toEqual(['list.item2']);
      
      el.setAttribute('context', 'list2');
      await elementUpdated(el);
      
      expect(handler.calls.argsFor(1)[0].detail).toEqual(['list2.item2']);
    });

    it('should dispatch getters after state is started', async () => {
      const handler = jasmine.createSpy();
      const parentNode = await fixture('<div state="myApp2"></div>');
      const el: Route = await fixture(`<tb-route context="list" model="item" path="/user/:id"></tb-route>`, { parentNode });
      
      on('myApp2-add-getters', handler);

      fire('myApp2-state-started');

      expect(handler.calls.argsFor(0)[0].detail).toEqual(['list.item']);
    });
  });
});