import { customElement, html, property } from "lit-element";
import { fire, on } from "../util";
import { match, MatchFunction, Match } from 'path-to-regexp';
import observeAnchors from "./observeAnchors";
import TurboComponent from "./TurboComponent";

@customElement('tb-route')
export default class Route extends TurboComponent {

  @property()
  path: string|undefined;

  @property()
  action: string|undefined;

  private matchFn: MatchFunction|undefined;

  private match: Match|false = false;

  isMatching () {
    return this.matchFn && this.matchFn(this.pagePath) !== false;
  }

  setSelected (isSelected: boolean) {
    if (this.matchFn) {
      this.match = isSelected ? this.matchFn(this.pagePath) : false;
      this.fireAction();
      this.requestUpdate();
    }
  }

  private fireAction () {
    if (this.action && this.match) {
      fire(`${this.stateName}-action`, {
        data: {
          params: this.match.params
        },
        actionName: this.action,
        model: this.fullModelPath
      });
    }
  }

  private get pagePath () {
    return location.pathname;
  };

  updated (changedProps: any) {
    super.updated(changedProps);

    if (this.shadowRoot) {
      observeAnchors(this.shadowRoot);
    }
  }

  connectedCallback () {
    super.connectedCallback();
    on(`${this.stateName}-state-started`, () => {
      this.dispatchGetters();
    });
    this.dispatchGetters();
  }

  dispatchGetters () {
    fire(`${this.stateName}-add-getters`, [this.fullModelPath]);
  }

  attributeChangedCallback (name: string, old: string, value: string) {
    super.attributeChangedCallback(name, old, value);
    if (name === 'path' && value) {
      this.matchFn = match(value, { end: false });
    }
    // if the model or context property changes
    // the route fires the action again
    if (name === 'model' || name === 'context') {
      this.fireAction();
      this.dispatchGetters();
    }
  }

  render () {
    if (this.match !== false) {
      this.dispatchEvent(new CustomEvent('match'));
    }
    return this.match == false
      ? html``
      : html`<slot></slot>`;
  }
}