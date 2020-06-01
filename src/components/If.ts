import { customElement, html, property } from "lit-element";
import TurboComponent from "./TurboComponent";
import { jsonParseFromHtml } from "./parseTemplate";

@customElement('tb-if')
export default class If extends TurboComponent {

  get condition (): boolean {
    return this.model ? Boolean(this.modelValue) : jsonParseFromHtml(this.value);
  }

  render () {
    return this.condition ? html`<slot></slot>`: html``; 
  }
}