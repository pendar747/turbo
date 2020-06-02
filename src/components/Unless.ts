import { customElement, html } from "lit-element";
import TurboComponent from "./TurboComponent";

@customElement('tb-unless')
export default class Unless extends TurboComponent {
  render () {
    return Boolean(this.value) ? html`` : html`<slot></slot>`; 
  }
}