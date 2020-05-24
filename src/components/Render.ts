import { customElement, html, property } from "lit-element";
import TurboComponent from "./TurboComponent";
import { renderContent, jsonStringifyForHTML } from "./renderContent";
import observeActions from "./observeActions";

@customElement('tb-render')
export default class Render extends TurboComponent {
  @property()
  template: string|null = null;

  @property()
  if: string|null = null;

  @property()
  ifValue: string|null = null;

  @property()
  unless: string|null = null;

  @property()
  unlessValue: string|null = null;

  private observer: MutationObserver|undefined;

  private get templateContent () {
    return this.template ? document.getElementById(this.template)?.innerHTML || '' : '';
  }
  
  renderElements () {
    return this.modelValue.map((valueItem: any, index: number) => {
      if (this.model) {
        return html`<tb-render model="${this.model}[${index}]" template="${this.template}"></tb-render>`
      }
      if (this.value) {
        return html`<tb-render value="${jsonStringifyForHTML(valueItem)}" template="${this.template}"></tb-render>`
      }
    })
  }

  constructor () {
    super();
    if (this.shadowRoot) {
      this.observer = observeActions(this.shadowRoot, { model: this.model });
    }
  }

  attributeChangedCallback (name: string, old: string, value: string) {
    super.attributeChangedCallback(name, old, value);
    if (name === 'model') {
      this.observer?.disconnect();
      if (this.shadowRoot) {
        this.observer = observeActions(this.shadowRoot, { model: this.model })
      }
    }
  }

  disconnectedCallback () {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  render () {
    if (this.modelValue === null || this.modelValue === undefined) {
      return;
    }
    const content = Array.isArray(this.modelValue) 
      ? html`<div id="container">${this.renderElements()}</div>`
      : html`<div id="container" .innerHTML="${renderContent(this.templateContent)(this.modelValue)}"></div>`;

    if (this.if) {
      return html`<tb-if model="${this.if}">${content}</tb-if>`;
    }

    if (this.ifValue) {
      return html`<tb-if value="${this.ifValue}">${content}</tb-if>`;
    }

    if (this.unless) {
      return html`<tb-unless model="${this.unless}">${content}</tb-unless>`;
    }
    
    if (this.unlessValue) {
      return html`<tb-unless value="${this.unlessValue}">${content}</tb-unless>`;
    }

    return content;
  }
}