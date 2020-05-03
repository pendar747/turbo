import { fixture } from '@open-wc/testing-helpers';
import './Render';

describe('Render', () => {

  it('should render the given content', async () => {
    await fixture('<template id="my-template">My name is {name}.</template>')
    const el = await fixture(`
      <tb-render template="my-template" value="{'name':'John'}"></tb-render>
    `);
    expect(el.shadowRoot?.textContent).toEqual('My name is John.');
  });
});