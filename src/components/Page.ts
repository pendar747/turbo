import { LitElement, customElement, html } from "lit-element";
import { on } from "../util";
import { pathToRegexp } from 'path-to-regexp';

@customElement('tb-page')
export default class Page extends LitElement {

  private pagePath = location.pathname;

  get pageAddress (): string {
    return '';
  }

  get templateElement (): HTMLTemplateElement|undefined {
    return Array.from(document.querySelectorAll('template')).find(el => {
      const pathPattern = el.getAttribute('page-path');
      if (pathPattern) {
        const pathRegexp = pathToRegexp(pathPattern);
        return pathRegexp.test(this.pagePath);
      }
    });
  }

  get templateContent (): string {
    return this.templateElement?.innerHTML ?? '';
  }

  connectedCallback () {
    const onPageChange = async () => {
      this.pagePath = location.pathname;
      this.requestUpdate();
    };
    window.addEventListener('popstate', onPageChange);
    on('page-change', onPageChange);
    super.connectedCallback();
  }

  render () {
    return html`${this.templateContent}`;
  }
}