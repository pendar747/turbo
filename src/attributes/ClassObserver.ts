import get from 'lodash-es/get';
import AttributeObserver from './AttributeObserver';
import getValueList from './getValueList';

class ClassObserver extends AttributeObserver {

  constructor (targetNode: Element|ShadowRoot, data: any) {
    super(targetNode, data, 'tb-class');
    this.observe();
  }

  applyChanges(elements: Element[], data: any) {
    elements.forEach(element => {
      const matches = getValueList(element.getAttribute('tb-class'))
        .map(({ property, value }) => ({ condition: property, classNames: value.split(',') }))

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