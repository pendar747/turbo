import get from 'lodash-es/get';
import AttributeObserver from './AttributeObserver';
import getValueList from './getValueList';
import addNewGetters from './addNewGetters';

class ClassObserver extends AttributeObserver {

  getters: string[] = [];

  constructor (targetNode: Element|ShadowRoot, data: any, stateName: string, model: string) {
    super(targetNode, data, 'tb-class', stateName, model);
    this.observe();
  }

  set stateName (value: string) {
    this.getters = [];
    super.stateName = value;
  }

  private addNewGetters = addNewGetters;
    
  applyChanges(elements: Element[], data: any) {
    elements.forEach(element => {
      const matches = getValueList(element.getAttribute('tb-class'))
        .map(({ property, value }) => ({ condition: property, classNames: value.split(',') }))

      this.addNewGetters(matches.map(({ condition }) => condition));

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