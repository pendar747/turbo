import get from 'lodash-es/get';
import AttributeObserver from './AttributeObserver';

const pattern = /([A-Za-z0-9_]*):([A-Za-z0-9-,]*)/;

class ClassObserver extends AttributeObserver {

  constructor (targetNode: Element|ShadowRoot, data: any) {
    super(targetNode, data);
    this.attributeName = 'tb-class';
    this.observe();
  }

  applyChanges(elements: Element[], data: any) {
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
  }
}

export default ClassObserver;