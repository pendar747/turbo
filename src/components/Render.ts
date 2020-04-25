import { customElement, html, property } from "lit-element";
import TurboComponent from "./TurboComponent";
import { renderContent } from "./renderContent";

@customElement('tb-render')
export default class Render extends TurboComponent {
  @property()
  as: string = 'this';

  @property()
  template: string|null = null;

  private get templateContent () {
    return this.template ? document.getElementById(this.template)?.innerHTML || '' : '';
  }

  render () {
    return html`<div id="container" .innerHTML="${renderContent(this.templateContent, this.as)(this.modelValue)}"></div>`;
  }
}