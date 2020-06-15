import { fixture, elementUpdated } from "@open-wc/testing-helpers";
import './Page';
import { fire } from "../util";

describe('Page', () => {

  beforeEach(() => {
    document.querySelectorAll('template').forEach(el => el.remove());
    document.querySelectorAll('tb-page').forEach(el => el.remove());
  });

  afterEach(() => {
    history.replaceState({}, '/', '/');
  });

  it('should render the content of the template with the same id as the page path', async () => {
    await fixture(`
      <template page-path="/page-2">
        <h1>Page 2</h1>
        <p>content</p>
      </template>
    `);
    history.pushState({ page: 'page-2' }, 'Page 2', '/page-2');
    const el = await fixture('<tb-page></tb-page>');

    expect(el.shadowRoot?.textContent).toContain('Page 2');
    expect(el.shadowRoot?.textContent).toContain('content');
  });
  
  it('should change the rendered content when the path changes', async () => {
    await fixture(`
      <template page-path="/page-2">
        <h1>Page 2</h1>
        <p>content</p>
      </template>
      
      <template page-path="/page-3">
        <h1>Page 3</h1>
        <p>content 3</p>
      </template>
    `);

    history.pushState({ page: 'page-2' }, 'Page 2', '/page-2');
    const el = await fixture('<tb-page></tb-page>');
    
    expect(el.shadowRoot?.textContent).toContain('Page 2');
    expect(el.shadowRoot?.textContent).toContain('content');

    history.pushState({ page: 'page-3' }, 'Page 3', '/page-3');
    fire('page-change');
    
    await elementUpdated(el);
    expect(el.shadowRoot?.textContent).toContain('Page 3');
    expect(el.shadowRoot?.textContent).toContain('content 3');
  });
  
  it('should handle nested page paths', async () => {
    await fixture(`
      <template page-path="/page-2">
        <h1>Page 2</h1>
        <p>content</p>
      </template>
      
      <template page-path="/page-2/nested-page">
        <h1>Nested Page</h1>
        <p>nested content</p>
      </template>
    `);

    history.pushState({ page: 'page-2' }, 'Page 2', '/page-2');
    const el = await fixture('<tb-page id="3"></tb-page>');
    
    expect(el.shadowRoot?.textContent).toContain('Page 2');
    expect(el.shadowRoot?.textContent).toContain('content');

    history.pushState({ page: 'page-2/nested-page' }, 'Page 3', '/page-2/nested-page');
    fire('page-change');
    
    await elementUpdated(el);
    expect(el.shadowRoot?.textContent).toContain('Nested Page');
    expect(el.shadowRoot?.textContent).toContain('nested content');
  });

  it('should work with dynamic routes', async () => {
    await fixture(`
      <template page-path="/page-2/:id/page-3">
        <h1>Page 3</h1>
        <p>Content of page 3</p>
      </template>
    `);

    history.pushState({ page: 'page-3' }, 'Page 3', '/page-2/2/page-3');
    const el = await fixture('<tb-page id="5"></tb-page>');
    
    expect(el.shadowRoot?.textContent).toContain('Page 3');
    expect(el.shadowRoot?.textContent).toContain('Content of page 3');
  });
  
  it('should work with dynamic routes when page changes', async () => {
    await fixture(`
      <template page-path="/page-2/:id/page-3">
        <h1>Page 3</h1>
        <p>Content of page 3</p>
      </template>
      
      <template page-path="/page-2/:id/page-4">
        <h1>Page 4</h1>
        <p>Content of page 4</p>
      </template>
    `);

    history.pushState({ page: 'page-3' }, 'Page 3', '/page-2/2/page-3');
    const el = await fixture('<tb-page id="6"></tb-page>');
    
    expect(el.shadowRoot?.textContent).toContain('Page 3');
    expect(el.shadowRoot?.textContent).toContain('Content of page 3');
    
    history.pushState({ page: 'page-4' }, 'Page 4', '/page-2/2/page-4');
    fire('page-change');
    
    await elementUpdated(el);
    expect(el.shadowRoot?.textContent).toContain('Page 4');
    expect(el.shadowRoot?.textContent).toContain('Content of page 4');
  });

  it('should make a request to get the page template (using a pageUrlMap stored in ' + 
  'local storage) from a file when template is not found', async () => {
    const originalFetch = window.fetch;
    window.fetch = async (): Promise<any> => {
      return {
        async text () {
          return `
            <template page-path="/page-6/:id/page-3">
              <h1>Page 3</h1>
              <p>Content of page 3</p>
            </template>
          `
        }
      }
    }

    sessionStorage.setItem('page-url-maps', JSON.stringify([{
      pattern: '/page-6/:id/page-3',
      page: '/page-6/page-3.html'
    }]));
    
    history.pushState({ page: '/page-6/2/page-3' }, 'My Page', '/page-6/2/page-3');
    const el = await fixture('<tb-page id="7"></tb-page>');
    
    await elementUpdated(el);
    expect(el.shadowRoot?.textContent).toContain('Page 3');
    expect(el.shadowRoot?.textContent).toContain('Content of page 3');
    
    window.fetch = originalFetch;
  });

  it('should fetch the html page when the page path changes', async () => {
    const originalFetch = window.fetch;
    window.fetch = async (url: any): Promise<any> => {
      return {
        async text () {
          if (url === '/page-6/page-3.html') {
            return `
              <template page-path="/page-6/:id/page-3">
                <h1>Page 3</h1>
                <p>Content of page 3</p>
              </template>
            `
          }
          if (url === '/page-6/page-2.html') {
            return `
              <template page-path="/page-6/:id/page-2">
                <h1>Awesome page</h1>
                <p>Content of awesome page</p>
              </template>
            `
          }
        }
      }
    }

    sessionStorage.setItem('page-url-maps', JSON.stringify([{
      pattern: '/page-6/:id/page-3',
      page: '/page-6/page-3.html'
    }, {
      pattern: '/page-6/:id/page-2',
      page: '/page-6/page-2.html'
    }]));

    history.pushState({ page: '/page-6/2/page-3' }, 'My Page', '/page-6/2/page-3');
    const el = await fixture('<tb-page id="2"></tb-page>');
    
    await elementUpdated(el);
    expect(el.shadowRoot?.textContent).toContain('Page 3');
    expect(el.shadowRoot?.textContent).toContain('Content of page 3');

    history.pushState({ page: 'awesome page' }, 'awesome page', '/page-6/2/page-2');
    fire('page-change');
    
    await elementUpdated(el);
    await elementUpdated(el);
    expect(el.shadowRoot?.textContent).toContain('Awesome page');
    expect(el.shadowRoot?.textContent).toContain('Content of awesome page');
    
    window.fetch = originalFetch;
  });
  
  it('should only call the api when the template is missing', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.resolveTo({
      async text () {
        return `
          <template page-path="/page-6/:id/page-3">
            <h1>Page 3</h1>
            <p>Content of page 3</p>
          </template>
        `
      }
    } as any);

    sessionStorage.setItem('page-url-maps', JSON.stringify([{
      pattern: '/page-6/:id/page-3',
      page: '/page-6/page-3.html'
    }, {
      pattern: '/page-6/:id/page-2',
      page: '/page-6/page-2.html'
    }]));

    history.pushState({ page: '/page-6/2/page-3' }, 'My Page', '/page-6/2/page-3');
    const el = await fixture('<tb-page id="1"></tb-page>');

    await elementUpdated(el);

    expect(fetchSpy.calls.count()).toEqual(1);
    expect(fetchSpy.calls.mostRecent().args).toEqual(['/page-6/page-3.html']);

    history.pushState({ page: '/page-6/2/page-2' }, 'Page 2', '/page-6/2/page-2');
    fire('page-change');
    
    await elementUpdated(el);
    await elementUpdated(el);
        
    history.pushState({ page: '/page-6/2/page-3' }, 'My Page', '/page-6/2/page-3');
    fire('page-change');
    
    await elementUpdated(el);
    await elementUpdated(el);
    
    expect(fetchSpy.calls.count()).toEqual(2);
    expect(fetchSpy.calls.mostRecent().args).toEqual(['/page-6/page-2.html']);
  });
});