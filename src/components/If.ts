import { customElement, html } from "lit-element";
import TurboComponent from "./TurboComponent";

@customElement('tb-if')
export default class If extends TurboComponent {
  render () {
    return Boolean(this.value) ? html`<slot></slot>`: html``; 
  }
}