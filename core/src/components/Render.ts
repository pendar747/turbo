import { customElement, html, property } from "lit-element";
import PernixComponent from "./PernixComponent";
import parseTemplate from "./parseTemplate";
import ActionObserver from "../attributes/ActionObserver";
import { fire, on } from "../util";
import ClassObserver from "../attributes/ClassObserver";
import BindObserver from "../attributes/BindObserver";
import BindPropObserver from "../attributes/BindPropObserver";
import observeAnchors from "./observeAnchors";
import isNil from 'lodash-es/isNil';

@customElement('px-render')
export default class Render extends PernixComponent {
  @property()
  template: string|null = null;

  @property()
  if: string|null = null;

  @property()
  unless: string|null = null;

  @property({ converter: (value: string|null) => typeof value === 'string' })
  repeat: boolean = false;

  getters: string[] = [];

  renderContent: ((data: any) => string)|undefined;

  private actionObserver: ActionObserver|undefined;
  private classObserver: ClassObserver|undefined;
  private bindObserver: BindObserver|undefined;
  private bindPropObserver: BindPropObserver|undefined;

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
      return html`<px-render no-context model="${this.fullModelPath}[${index}]" template="${this.template}"></px-render>`
    })
  }

  attributeChangedCallback (name: string, old: string, value: string) {
    super.attributeChangedCallback(name, old, value);
    if (name === 'model' || name === 'context') {
      if (this.actionObserver && this.stateName) {
        this.actionObserver.model = this.fullModelPath;
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
      const gettersWithFullPath = this.repeat ? [] : this.getters.map(getter => `${this.fullModelPath}.${getter}`);
      const allGetters = [...gettersWithFullPath, this.fullModelPath];
      if (allGetters.length) {
        fire(`${this.stateName}-add-getters`, allGetters);
      }
    }
  }

  connectedCallback () {
    super.connectedCallback();
    if (this.shadowRoot && this.stateName) {
      this.actionObserver = new ActionObserver(this.shadowRoot, this.stateName, this.fullModelPath);
      this.classObserver = new ClassObserver(this.shadowRoot, this.value, this.stateName, this.fullModelPath);
      this.bindObserver = new BindObserver(this.shadowRoot, this.value, this.stateName, this.fullModelPath);
      this.bindPropObserver = new BindPropObserver(this.shadowRoot, this.value, this.stateName, this.fullModelPath);
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
      ...Array.from(this.shadowRoot?.querySelectorAll('px-render') ?? []),
      ...Array.from(this.shadowRoot?.querySelectorAll('px-route') ?? [])
    ];
    renderElements.forEach(el => {
      if (!el.hasAttribute('context') && !el.hasAttribute('no-context')) {
        el.setAttribute('context', this.fullModelPath);
      }
    })
    if (this.shadowRoot) {
      observeAnchors(this.shadowRoot);
    }
    super.updated(changedProps);
  }

  render () {
    if (this.classObserver && this.bindObserver && this.bindPropObserver) {
      this.classObserver.data = this.value;
      this.bindObserver.data = this.value;
      this.bindPropObserver.data = this.value;
    }
    if (this.fullModelPath.length > 0 && isNil(this.value)) {
      return;
    }
    const content = this.repeat
      ? html`<div id="container">${this.renderElements()}</div>`
      : this.renderContent 
        ? html`<div id="container" .innerHTML="${this.renderContent(this.value)}"></div>` 
        : '';

    if (this.if) {
      return html`<px-if context="${this.fullModelPath}" model="${this.if}">${content}</px-if>`;
    }

    if (this.unless) {
      return html`<px-unless context="${this.fullModelPath}" model="${this.unless}">${content}</px-unless>`;
    }
    
    return content;
  }
}