import { customElement, html, property } from "lit-element";
import { on, fire } from "../util";
import { match, MatchFunction, Match, pathToRegexp } from 'path-to-regexp';
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

  private onPageChange = async () => {
    debugger;
    this.match = this.matchFn ? this.matchFn(this.pagePath) : false;
    if (this.isConnected) {
      this.fireAction();
      this.requestUpdate();
    }
  }

  attributeChangedCallback (name: string, old: string, value: string) {
    super.attributeChangedCallback(name, old, value);
    if (name == 'path') {
      this.matchFn = match(value, { end: false });
    }
  }

  disconnectedCallback () {
    // TODO: fix removeEventListener to work properly
    super.disconnectedCallback();
    window.removeEventListener('popstate', this.onPageChange);
    document.removeEventListener('page-change', this.onPageChange);
  }

  connectedCallback () {
    on(`${this.stateName}-state-started`, () => {
      this.onPageChange();
    });
    this.onPageChange();
    window.addEventListener('popstate', this.onPageChange);
    on('page-change', this.onPageChange);
    super.connectedCallback();
  }

  updated (changedProps: any) {
    super.updated(changedProps);

    if (this.shadowRoot) {
      observeAnchors(this.shadowRoot);
    }
  }

  render () {
    return this.match == false
      ? html``
      : html`<slot></slot>`;
  }
}