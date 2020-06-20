abstract class AttributeObserver<DataT = any> {

  private observer: MutationObserver;
  private _data: DataT;
  private elements: Element[] = [];
  protected attributeName: string ;
  protected targetNode: Element|ShadowRoot;

  constructor (targetNode: Element|ShadowRoot, data:DataT, attributeName: string) {
    this._data = data;
    this.targetNode = targetNode;
    this.attributeName = attributeName;
    this.observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          this.elements = Array.from(mutation.addedNodes)
            .filter(element => element.nodeType == Node.ELEMENT_NODE 
                && (element as Element).hasAttribute(this.attributeName)) as Element[];

          const nestedElements = Array.from(mutation.addedNodes)
            .filter(el => el.nodeType === Node.ELEMENT_NODE)
            .map(el => Array.from((el as Element).querySelectorAll(`[${this.attributeName}]`)))
            .flat();
          
          this.elements = [...this.elements, ...nestedElements];
          
          this.applyChanges(this.elements, this._data);
        } else if (mutation.type === 'attributes' && mutation.attributeName === this.attributeName && mutation.target.nodeType == Node.ELEMENT_NODE) {
          if (!this.elements.includes(mutation.target as Element)) {
            this.elements.push(mutation.target as Element);
          }
          this.applyChanges(this.elements, this._data);
        }
      }
    });

    this.elements = Array.from(targetNode.querySelectorAll(`[${this.attributeName}]`));
    if (targetNode.nodeType == Node.ELEMENT_NODE && (targetNode as Element).hasAttribute(this.attributeName)) {
      this.elements.push(targetNode as Element);
    }
  }

  observe (options: MutationObserverInit = { attributes: true, childList: true, subtree: true }) {
    // Start observing the target node for configured mutations
    this.applyChanges(this.elements, this._data);    
    this.observer.observe(this.targetNode, options);
  }

  abstract applyChanges(elements: Element[], data: DataT): void;

  disconnect () {
    this.observer.disconnect();
  }

  set data (value: DataT) {
    this._data = value;
    this.applyChanges(this.elements, this._data);
  }
}

export default AttributeObserver;