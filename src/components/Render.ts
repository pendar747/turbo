import { customElement, html, property } from "lit-element";
import TurboComponent from "./TurboComponent";
import parseTemplate from "./parseTemplate";
import observeActions from "./observeActions";
import { fire, on } from "../util";
import ClassObserver from "./ClassObserver";

@customElement('tb-render')
export default class Render extends TurboComponent {
  @property()
  template: string|null = null;

  @property()
  if: string|null = null;

  @property()
  unless: string|null = null;

  renderContent: ((data: any) => string)|undefined;

  private actionObserver: MutationObserver|undefined;
  private classObserver: ClassObserver|undefined;

  private get templateContent () {
    return this.template ? document.getElementById(this.template)?.innerHTML || '' : '';
  }
  
  renderElements () {
    if (!this.value) {
      return;
    }
    if (!this.value.length) {
      return;
    }
    return this.value.map((valueItem: any, index: number) => {
      return html`<tb-render no-context model="${this.fullModelPath}[${index}]" template="${this.template}"></tb-render>`
    })
  }

  attributeChangedCallback (name: string, old: string, value: string) {
    super.attributeChangedCallback(name, old, value);
    if (name === 'model') {
      this.actionObserver?.disconnect();
      if (this.shadowRoot && this.stateName) {
        this.actionObserver = observeActions(this.shadowRoot, this.stateName, { model: this.model })
      }
    }
  }

  disconnectedCallback () {
    this.actionObserver?.disconnect();
    this.classObserver?.disconnect();
  }

  connectedCallback () {
    super.connectedCallback();
    if (this.shadowRoot && this.stateName) {
      this.actionObserver = observeActions(this.shadowRoot, this.stateName, { model: this.model });
      this.classObserver = new ClassObserver(this.shadowRoot, this.value);
    }
    const { render, getters } = parseTemplate(this.templateContent);
    this.renderContent = render;
    // todo give this more thought
    // state needs to run before dispatching getters
    const dispatchGetters = () => {
      if (this.stateName) {
        const gettersWithFullPath = Array.isArray(this.value) ? [] : getters.map(getter => `${this.fullModelPath}.${getter}`);
        fire(`${this.stateName}-add-getters`, [...gettersWithFullPath, this.fullModelPath]);
      }
    }
    on(`${this.stateName}-state-started`, () => {
      dispatchGetters();
    });
    dispatchGetters();
  }

  updated (changedProps: any) {
    const renderElements = [
      ...Array.from(this.shadowRoot?.querySelectorAll('tb-render') ?? []),
      ...Array.from(this.shadowRoot?.querySelectorAll('tb-form') ?? [])
    ];
    renderElements.forEach(el => {
      if (this.model && !el.hasAttribute('context') && !el.hasAttribute('no-context')) {
        el.setAttribute('context', this.model);
      }
    })
    super.updated(changedProps);
  }

  render () {
    if (this.classObserver) {
      this.classObserver.data = this.value;
    }
    if (this.value === null || this.value === undefined) {
      return;
    }
    const content = Array.isArray(this.value)
      ? html`<div id="container">${this.renderElements()}</div>`
      : this.renderContent 
        ? html`<div id="container" .innerHTML="${this.renderContent(this.value)}"></div>` 
        : '';

    if (this.if) {
      return html`<tb-if model="${this.if}">${content}</tb-if>`;
    }

    if (this.unless) {
      return html`<tb-unless model="${this.unless}">${content}</tb-unless>`;
    }
    
    return content;
  }
}