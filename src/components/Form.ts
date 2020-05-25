import TurboComponent from "./TurboComponent";
import { customElement, html, property } from "lit-element";
import { fire } from "../util";

@customElement('tb-form')
class Form extends TurboComponent {

  @property()
  public action: string|undefined;

  get inputElements (): HTMLInputElement[] {
    return Array.from(this.querySelectorAll('input'));
  }
  
  get values (): { [key in string]: string } {
    return this.inputElements.reduce((map, el) => {
      return {
        ...map,
        [el.name]: el.value
      }
    }, {} as any);
  }

  handleSubmit (event: Event) {
    event.preventDefault();
    if (this.action) {
      fire(this.action, { model: this.model, values: this.values });
    }
  }

  render () {
    this.inputElements.forEach(el => {
      if (this.modelValue) {
        el.value = this.modelValue[el.name];
      }
    });
    return html`<form @submit="${this.handleSubmit}">
      <slot></slot>
    </form>`;
  }
}

export default Form;