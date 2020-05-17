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
    const pageUrlMaps: PageUrlMap[] = JSON.parse(localStorage.getItem('page-url-maps') || '[]');
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

  

  connectedCallback () {
    const onPageChange = async () => {
      this.pagePath = location.pathname;
      if (!this.templateElement) {
        await this.fetchHtml();
      }
      this.requestUpdate();
    };
    onPageChange();
    window.addEventListener('popstate', onPageChange);
    on('page-change', onPageChange);
    super.connectedCallback();
  }

  render () {
    return html`${this.templateContent}`;
  }
}