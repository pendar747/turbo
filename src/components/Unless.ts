import { customElement, html, property } from "lit-element";
import TurboComponent from "./TurboComponent";
import { jsonParseFromHtml } from "./renderContent";

@customElement('tb-unless')
export default class Unless extends TurboComponent {

  get condition (): boolean {
    return this.model ? Boolean(this.modelValue) : jsonParseFromHtml(this.value);
  }
  
  render () {
    return this.condition ? html`` : html`<slot></slot>`; 
  }
}