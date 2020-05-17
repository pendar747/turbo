import { fixture, elementUpdated } from "@open-wc/testing-helpers";
import './Page';
import { fire } from "../util";

describe('Page', () => {

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
    const el = await fixture('<tb-page></tb-page>');
    
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
    const el = await fixture('<tb-page></tb-page>');
    
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
    const el = await fixture('<tb-page></tb-page>');
    
    expect(el.shadowRoot?.textContent).toContain('Page 3');
    expect(el.shadowRoot?.textContent).toContain('Content of page 3');
    
    history.pushState({ page: 'page-4' }, 'Page 4', '/page-2/2/page-4');
    fire('page-change');
    
    await elementUpdated(el);
    expect(el.shadowRoot?.textContent).toContain('Page 4');
    expect(el.shadowRoot?.textContent).toContain('Content of page 4');
  });
});