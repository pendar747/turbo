import { customElement, html, property } from "lit-element";
import TurboComponent from "./TurboComponent";
import parseTemplate from "./parseTemplate";
import ActionObserver from "../attributes/ActionObserver";
import { fire, on } from "../util";
import ClassObserver from "../attributes/ClassObserver";
import BindObserver from "../attributes/BindObserver";

@customElement('tb-render')
export default class Render extends TurboComponent {
  @property()
  template: string|null = null;

  @property()
  if: string|null = null;

  @property()
  unless: string|null = null;

  getters: string[] = [];

  renderContent: ((data: any) => string)|undefined;

  private actionObserver: ActionObserver|undefined;
  private classObserver: ClassObserver|undefined;
  private bindObserver: BindObserver|undefined;

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
    if (name === 'model' || name === 'context') {
      if (this.actionObserver && this.stateName) {
        this.actionObserver.data = {
          stateName: this.stateName,
          model: this.model ?? undefined
        }
      }
      this.dispatchGetters();
    }
  }

  disconnectedCallback () {
    this.actionObserver?.disconnect();
    this.classObserver?.disconnect();
    this.bindObserver?.disconnect();
  }

  dispatchGetters () {
    if (this.stateName) {
      const gettersWithFullPath = Array.isArray(this.value) ? [] : this.getters.map(getter => `${this.fullModelPath}.${getter}`);
      const allGetters = [...gettersWithFullPath, this.fullModelPath];
      if (allGetters.length) {
        fire(`${this.stateName}-add-getters`, allGetters);
      }
    }
  }

  connectedCallback () {
    super.connectedCallback();
    if (this.shadowRoot && this.stateName) {
      this.actionObserver = new ActionObserver(this.shadowRoot, {
        stateName: this.stateName,
        model: this.model ?? undefined
      });
      this.classObserver = new ClassObserver(this.shadowRoot, this.value);
      this.bindObserver = new BindObserver(this.shadowRoot, this.value);
    }
    const { render, getters } = parseTemplate(this.templateContent);
    this.renderContent = render;
    this.getters = getters;
    on(`${this.stateName}-state-started`, () => {
      this.dispatchGetters();
    });
    this.dispatchGetters();
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
    if (this.classObserver && this.bindObserver) {
      this.classObserver.data = this.value;
      this.bindObserver.data = this.value;
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