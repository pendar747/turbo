import { customElement, html, property } from "lit-element";
import TurboComponent from "./TurboComponent";
import { jsonStringifyForHTML } from "./renderContent";

@customElement('tb-repeat')
export default class Repeat extends TurboComponent {

  @property()
  as: string = 'this';
  
  @property()
  template: string|null = null;
    
  renderElements () {
    return this.modelValues.map((valueItem, index) => {
      if (this.model) {
        return html`<tb-template as="${this.as}" model="${this.model}[${index}]" template="${this.template}"><tb-template>`
      }
      if (this.value) {
        return html`<tb-template as="${this.as}" value="${jsonStringifyForHTML(valueItem)}" template="${this.template}"><tb-template>`
      }
    })
  }

  render () {
    return html`<div id="container">${this.renderElements()}</div>`;
  }
}