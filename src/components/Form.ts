import TurboComponent from "./TurboComponent";
import { customElement, html, property } from "lit-element";
import { fire } from "../util";

@customElement('tb-form')
class Form extends TurboComponent {

  @property()
  public submitEvent: string|undefined;
  
  @property()
  public changeEvent: string|undefined;

  private handlersMap = new Map<Element, (event: Event) => void>();

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

  get updateData () {
    return { model: this.model, values: this.values };
  }

  handleSubmit (event: Event) {
    event.preventDefault();
    if (this.submitEvent) {
      fire(this.submitEvent, this.updateData);
    }
  }

  attributeChangedCallback (name: string, old: string, value: string) {
    if (name == 'changeevent' && old !== value) {
      this.inputElements.forEach((el) => {
        const otherListener = this.handlersMap.get(el);
        if (otherListener) {
          el.removeEventListener('input', otherListener);
        }
        const handler = () => {
          fire(value, this.updateData);
        };
        el.addEventListener('input', handler);
        this.handlersMap.set(el, handler);
      });
    }
    super.attributeChangedCallback(name, old, value);
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