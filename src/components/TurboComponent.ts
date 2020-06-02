import { LitElement, property } from "lit-element";
import { on } from "../util";
import get from 'lodash-es/get';
import isEqual from 'lodash-es/isEqual';

export default abstract class TurboComponent extends LitElement {
  
  @property()
  model: string|null = null;

  protected _stateName: string|null = null;

  protected value: { [key in string]: any }|null = null;
  
  protected handleStateUpdate (state: any) {
    const prevModelValue = this.value;
    this.value = get(state, this.model||'', null);
    if (!isEqual(this.value, prevModelValue)) {
      this.performUpdate();
    }
  }

  protected get stateName () {
    if (this._stateName) {
      return this._stateName;
    }
    let parent: Element|null|undefined = this;
    while (parent && !this._stateName) {
      if (parent?.hasAttribute('state')) {
        this._stateName = parent.getAttribute('state'); 
      } else {
        parent = parent?.parentNode instanceof ShadowRoot
          ? parent?.parentNode.host 
          : parent.parentElement;
      }
    }
    return this._stateName;
  }
    
  connectedCallback () {
    if (this.model && this.stateName) {
      // get the initial state from local storage
      const storedState = localStorage.getItem(this.stateName);
      if(storedState) {
        try {
          this.handleStateUpdate(JSON.parse(storedState));
        } catch (error) {
          console.error(`Failed to parse ${this.stateName}`);
        }
      }
      // watch for state updates
      on(`${this.stateName}-state-update`, (event) => {
        this.handleStateUpdate(event.detail);
      });
    }
    super.connectedCallback();
  }

}