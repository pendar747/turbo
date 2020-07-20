import AttributeObserver from "./AttributeObserver";
import getValueList from "./getValueList";
import get from 'lodash-es/get';
import set from "lodash-es/set";
import addNewGetters from './addNewGetters';
import isNil from "lodash-es/isNil";

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

  setPropertyValue (element: Element, property: string, value: any) {
    // if the property type is string, setting null or undefined
    // will turn it into "undefined" and "null" which we need to avoid
    if (typeof get(element, property) === 'string' && isNil(value)) {
      return;
    }
    
    // set the property value with a delay to handle the case when
    // user action is currently changing the property
    setTimeout(() => {
      set(element, property, value);
    }, 500);
  }

  applyChanges (elements: Element[], data: any) {
    elements.forEach(element => {
      const matches = getValueList(element.getAttribute(this.attributeName))
        .map(({ property, value }) => ({ dataProperty: property, elementProperties: value.split(',')}))

      this.addNewGetters(matches.map(({ dataProperty }) => dataProperty));

      matches.forEach(({ dataProperty, elementProperties }) => {
        elementProperties.forEach(elementProp => {
          const value = get(data, dataProperty);
          this.setPropertyValue(element, elementProp, value);
        })
      });
    });
  }
}

export default BindPropObserver;