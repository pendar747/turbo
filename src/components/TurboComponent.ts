import { LitElement, property } from "lit-element";
import { on } from "../util";
import { jsonParseFromHtml } from "./parseTemplate";
import get from 'lodash-es/get';
import isEqual from 'lodash-es/isEqual';

export default abstract class TurboComponent extends LitElement {
  
  @property()
  model: string|null = null;

  @property()
  value: string|null = null;

  protected modelValue: { [key in string]: any }|null = null;
  
  protected handleStateUpdate (state: any) {
    const prevModelValue = this.modelValue;
    this.modelValue = get(state, this.model||'', null);
    if (!isEqual(this.modelValue, prevModelValue)) {
      this.performUpdate();
    }
  }

  private getModelFromValue () {
    if (!this.value) {
      return;
    }
    try {
      this.modelValue = jsonParseFromHtml(this.value);
    } catch (error) {
      console.error('failed to parse value for', this);
    }
  }

  private getStateName () {
    let stateName = null;
    let parent: Element|null|undefined = this;
    while (parent && !stateName) {
      if (parent?.hasAttribute('state')) {
        stateName = parent.getAttribute('state'); 
      } else {
        parent = parent?.parentNode instanceof ShadowRoot
          ? parent?.parentNode.host 
          : parent.parentElement;
      }
    }
    return stateName;
  }
  
  connectedCallback () {
    if (this.model) {
      const stateName = this.getStateName();
      
      if (stateName) {
        // get the initial state from local storage
        const storedState = localStorage.getItem(stateName);
        if(storedState) {
          try {
            this.handleStateUpdate(JSON.parse(storedState));
          } catch (error) {
            console.error(error);            
          }
        }
        // watch for state updates
        on(`${stateName}-state-update`, (event) => {
          this.handleStateUpdate(event.detail);
        });
      }
    }
    if (this.value) {
      this.getModelFromValue();
    }
    super.connectedCallback();
  }

}