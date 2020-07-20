import { customElement, html } from "lit-element";
import TurboComponent from "./TurboComponent";
import { fire, on } from "../util";

@customElement('tb-if')
export default class If extends TurboComponent {
  
  dispatchGetters () {
    if (this.stateName) {
      fire(`${this.stateName}-add-getters`, [this.fullModelPath]);
    }
  }

  connectedCallback () {
    on(`${this.stateName}-state-started`, () => {
      this.dispatchGetters();
    });
    this.dispatchGetters();
    super.connectedCallback();
  }

  render () {
    return Boolean(this.value) ? html`<slot></slot>`: html``; 
  }
}