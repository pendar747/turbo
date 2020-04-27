import { customElement, html, property } from "lit-element";
import TurboComponent from "./TurboComponent";

@customElement('tb-unless')
export default class Unless extends TurboComponent {

  get condition (): boolean {
    return this.model ? Boolean(this.modelValue) : this.value == 'true';
  }
  
  render () {
    return this.condition ? html`` : html`<slot></slot>`; 
  }
}