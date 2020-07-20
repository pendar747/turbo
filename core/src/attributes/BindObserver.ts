import AttributeObserver from "./AttributeObserver";
import getValueList from "./getValueList";
import get from 'lodash-es/get';
import { isNil } from "lodash-es";
import addNewGetters from './addNewGetters';

class BindObserver extends AttributeObserver {

  getters: string[] = [];

  constructor (targetNode: any, data: any, stateName: string, model: string) {
    super(targetNode, data, 'px-bind', stateName, model);
    this.observe();
  }
  
  set stateName (value: string) {
    this.getters = [];
    super.stateName = value;
  }

  private addNewGetters = addNewGetters;

  applyChanges (elements: Element[], data: any) {
    elements.forEach(element => {
      const matches = getValueList(element.getAttribute('px-bind'))
        .map(({ property, value }) => ({ property, attributeNames: value.split(',')}))

      this.addNewGetters(matches.map(({ property }) => property));

      matches.forEach(({ property, attributeNames }) => {
        attributeNames.forEach(attribute => {
          const value = get(data, property);
          if (value === false || isNil(value)) {
            element.removeAttribute(attribute);
          } else {
            element.setAttribute(attribute, value);
          }
        })
      });
    });
  }
}

export default BindObserver;