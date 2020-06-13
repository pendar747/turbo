import get from 'lodash-es/get';

const pattern = /([A-Za-z0-9_]*):([A-Za-z0-9-,]*)/;

const applyClasses = (elements: Element[], data: any) => {
  elements.forEach(element => {
    const classAttributeValue = element.getAttribute('tb-class');
    const parts = classAttributeValue?.split(';') ?? [];
    const matches = parts
      .map(parts => {
        const match = parts.match(pattern);
        return match ? { condition: match[1], classNames: match[2].split(',') }: undefined
      })
      .filter(value => value != undefined) as { condition: string, classNames: string[]}[];

    matches.forEach(({ condition, classNames }) => {
      const evaluatedCondition = get(data, condition);
      classNames.forEach(className => {
        if (evaluatedCondition) {
          element.classList.add(className);
        } else {
          element.classList.remove(className);
        }
      })
    })
  });
};

class ClassObserver {

  private observer: MutationObserver;
  private _data: any;
  private elements: Element[] = [];

  constructor (targetNode: Element|ShadowRoot, data:any) {
    this._data = data;
    this.observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          this.elements = Array.from(mutation.addedNodes)
            .filter(element => element.nodeType == Node.ELEMENT_NODE 
                && (element as Element).hasAttribute('tb-class')) as Element[];

          const nestedElements = Array.from(mutation.addedNodes)
            .filter(el => el.nodeType === Node.ELEMENT_NODE)
            .map(el => Array.from((el as Element).querySelectorAll('[tb-class]')))
            .flat();
          
          this.elements = [...this.elements, ...nestedElements];
          
          applyClasses(this.elements, this._data);
        } else if (mutation.type === 'attributes' && mutation.attributeName === 'tb-class' && mutation.target.nodeType == Node.ELEMENT_NODE) {
          if (!this.elements.includes(mutation.target as Element)) {
            this.elements.push(mutation.target as Element);
          }
          applyClasses(this.elements, this._data);
        }
      }
    });

    this.elements = Array.from(targetNode.querySelectorAll('[tb-class]'));
    if (targetNode.nodeType == Node.ELEMENT_NODE && (targetNode as Element).hasAttribute('tb-class')) {
      this.elements.push(targetNode as Element);
    }
    applyClasses(this.elements, this._data);
    
    // Start observing the target node for configured mutations
    this.observer.observe(targetNode, { 
      attributes: true, 
      childList: true, 
      subtree: true
    });
  }

  disconnect () {
    this.observer.disconnect();
  }

  set data (value: any) {
    this._data = value;
    applyClasses(this.elements, this._data);
  }
}

export default ClassObserver;