import TurboComponent from "./TurboComponent";
import { customElement, html, property } from "lit-element";
import { fire, on } from "../util";
import get from 'lodash-es/get';

@customElement('tb-form')
class Form extends TurboComponent {

  @property()
  public submitEvent: string|undefined;
  
  @property()
  public changeEvent: string|undefined;

  private handlersMap = new Map<Element, (event: Event) => void>();
  private submitHandlersMap = new Map<Element, (event: Event) => void>();

  get inputElements (): Element[] {
    const inputTags = ['input', 'textarea'];
    return inputTags
      .map(tagName => Array.from(this.querySelectorAll(tagName)))
      .flat();
  }

  get submitInputElements (): Element[] {
    return Array.from(this.querySelectorAll('[type="submit"]'));
  }
  
  get values (): { [key in string]: string } {
    return this.inputElements.reduce((map, el) => {
      const name = el.getAttribute('name')
      const value = get(el, 'value');
      return name 
        ? {
          ...map,
          [name]: value
        }
        : map;
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
  
  connectedCallback () {
    super.connectedCallback();
    const getters = Object.keys(this.values);
    // todo give this more thought
    // state needs to run before dispatching getters
    console.log('form getters', getters)
    const dispatchGetters = () => {
      if (this.stateName) {
        const gettersWithFullPath = getters.map(getter => `${this.fullModelPath}.${getter}`);
        fire(`${this.stateName}-add-getters`, [...gettersWithFullPath, this.fullModelPath]);
      }
    }
    on(`${this.stateName}-state-started`, () => {
      dispatchGetters();
    });
    dispatchGetters();
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
      const name = el.getAttribute('name');
      if (this.value && name) {
        (el as HTMLInputElement).value = this.value[name];
      }
    });
    return html`<form @submit="${this.handleSubmit}">
      <slot></slot>
    </form>`;
  }
}

export default Form;