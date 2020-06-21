import { LitElement, property } from "lit-element";
import { on } from "../util";
import get from 'lodash-es/get';

export default abstract class TurboComponent extends LitElement {

  @property()
  context: string|null = null;
  
  @property()
  model: string|null = null;

  private state: any = {};

  protected _stateName: string|null = null;

  protected get value (): { [key in string]: any }|null {
    return get(this.state, this.fullModelPath, null);
  };

  protected get fullModelPath () {
    return this.context 
      ? this.model ? `${this.context}.${this.model}` : this.context
      : (this.model ?? '');
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

  private getStoredState () {
    if (this.stateName) {
      // get the initial state from local storage
      const storedState = sessionStorage.getItem(this.stateName);
      if(storedState) {
        try {
          this.state = JSON.parse(storedState);
          this.performUpdate();
        } catch (error) {
          console.error(`Failed to parse ${this.stateName}`);
        }
      }
    }
  }
    
  connectedCallback () {
    // watch for state updates
    this.getStoredState();
    on(`${this.stateName}-state-update`, (event) => {
      this.state = event.detail.state;
      this.performUpdate();
    });
    super.connectedCallback();
  }

}