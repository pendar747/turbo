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
  private submitHandlersMap = new Map<Element, (event: Event) => void>();

  get inputElements (): HTMLInputElement[] {
    return Array.from(this.querySelectorAll('input'));
  }

  get submitInputElements (): Element[] {
    return Array.from(this.querySelectorAll('[type="submit"]'));
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
      fire(`${this.stateName}-action`, {
        actionName: this.submitEvent,
        data: this.values,
        model: this.model
      });
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
    this.submitInputElements.forEach((element) => {
      if (!this.submitHandlersMap.has(element)) {
        const handler = this.handleSubmit.bind(this);
        element.addEventListener('click', handler);
        this.submitHandlersMap.set(element, handler);
      }
    });
    this.inputElements.forEach(el => {
      if (this.value) {
        el.value = this.value[el.name];
      }
    });
    return html`<form @submit="${this.handleSubmit}">
      <slot></slot>
    </form>`;
  }
}

export default Form;