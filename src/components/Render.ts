import { customElement, html, property } from "lit-element";
import TurboComponent from "./TurboComponent";
import { renderContent, jsonStringifyForHTML } from "./renderContent";

@customElement('tb-render')
export default class Render extends TurboComponent {
  @property()
  as: string = 'this';

  @property()
  template: string|null = null;

  private get templateContent () {
    return this.template ? document.getElementById(this.template)?.innerHTML || '' : '';
  }
  
  renderElements () {
    return this.modelValue.map((valueItem: any, index: number) => {
      if (this.model) {
        return html`<tb-render as="${this.as}" model="${this.model}[${index}]" template="${this.template}"><tb-template>`
      }
      if (this.value) {
        return html`<tb-render as="${this.as}" value="${jsonStringifyForHTML(valueItem)}" template="${this.template}"><tb-template>`
      }
    })
  }

  render () {
    if (this.modelValue === null || this.modelValue === undefined) {
      return;
    }
    return Array.isArray(this.modelValue) 
      ? html`<div id="container">${this.renderElements()}</div>`
      : html`<div id="container" .innerHTML="${renderContent(this.templateContent, this.as)(this.modelValue)}"></div>`;
  }
}