import { customElement, html } from 'lit-element';
import PernixComponent from "./PernixComponent";
import { Route } from '..';
import { on } from '../util';

@customElement('px-switch')
export default class Switch extends PernixComponent {

  private get routes (): Route[] {
    return Array.from(this.querySelectorAll('px-route'));
  }
  
  private onPageChange = async () => {
    const firstMatchingRoute = this.routes.find(route => route.isMatching());
    if(firstMatchingRoute) {
      firstMatchingRoute.setSelected(true);
    }
    this.routes
      .filter(route => route !== firstMatchingRoute)
      .forEach(route => route.setSelected(false));
  }

  disconnectedCallback () {
    // TODO: fix removeEventListener to work properly
    super.disconnectedCallback();
    window.removeEventListener('popstate', this.onPageChange);
    document.removeEventListener('page-change', this.onPageChange);
  }

  connectedCallback () {
    on(`${this.stateName}-state-started`, () => {
      this.onPageChange();
    });
    this.onPageChange();
    window.addEventListener('popstate', this.onPageChange);
    on('page-change', this.onPageChange);
    super.connectedCallback();
  }

  render () {
    return html`<slot></slot>`;
  }
}