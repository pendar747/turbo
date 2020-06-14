import { LitElement, customElement, html } from "lit-element";
import { on } from "../util";
import { pathToRegexp } from 'path-to-regexp';

interface PageUrlMap {
  pattern: string,
  page: string
}

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

  get pageUrl (): string|undefined {
    const pageUrlMaps: PageUrlMap[] = JSON.parse(sessionStorage.getItem('page-url-maps') || '[]');
    const pageUrlMap = pageUrlMaps.find(({ pattern }) => {
      const regex = pathToRegexp(pattern);
      return regex.test(this.pagePath);
    });
    return pageUrlMap?.page;
  }

  private async fetchHtml () {
    const url = this.pageUrl;
    if (url) {
      const response = await fetch(url);
      const html = await response.text();
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      document.body.appendChild(wrapper);
    }
  }

  private onPageChange = async () => {
    if (this.isConnected) {
      this.pagePath = location.pathname;
      if (!this.templateElement) {
        await this.fetchHtml();
      }
      this.requestUpdate();
    }
  }

  disconnectedCallback () {
    // TODO: fix removeEventListener to work properly
    super.disconnectedCallback();
    window.removeEventListener('popstate', this.onPageChange);
    document.removeEventListener('page-change', this.onPageChange);
  }

  connectedCallback () {
    this.onPageChange();
    window.addEventListener('popstate', this.onPageChange);
    on('page-change', this.onPageChange);
    super.connectedCallback();
  }

  render () {
    return html`<div .innerHTML="${this.templateContent}"></div>`;
  }
}