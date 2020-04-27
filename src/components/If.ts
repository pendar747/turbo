import { customElement, html, property } from "lit-element";
import TurboComponent from "./TurboComponent";

@customElement('tb-if')
export default class If extends TurboComponent {

  get condition (): boolean {
    return this.model ? Boolean(this.modelValue) : this.value == 'true';
  }

  render () {
    console.log('if', this.condition);
    return this.condition ? html`<slot></slot>`: html``; 
  }
}