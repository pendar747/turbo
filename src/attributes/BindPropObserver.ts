import AttributeObserver from "./AttributeObserver";
import getValueList from "./getValueList";
import get from 'lodash-es/get';
import set from "lodash-es/set";
import addNewGetters from './addNewGetters';

class BindPropObserver extends AttributeObserver {

  getters: string[] = [];

  constructor (targetNode: any, data: any, stateName: string, model: string) {
    super(targetNode, data, 'tb-bind-prop', stateName, model);
    this.observe();
  }
  
  set stateName (value: string) {
    this.getters = [];
    super.stateName = value;
  }

  private addNewGetters = addNewGetters;

  applyChanges (elements: Element[], data: any) {
    elements.forEach(element => {
      const matches = getValueList(element.getAttribute(this.attributeName))
        .map(({ property, value }) => ({ dataProperty: property, elementProperties: value.split(',')}))

      this.addNewGetters(matches.map(({ dataProperty }) => dataProperty));

      matches.forEach(({ dataProperty, elementProperties }) => {
        elementProperties.forEach(elementProp => {
          const value = get(data, dataProperty);
          set(element, elementProp, value);
        })
      });
    });
  }
}

export default BindPropObserver;