import AttributeObserver from "./AttributeObserver";
import getValueList from "./getValueList";
import get from 'lodash-es/get';
import set from "lodash-es/set";

class BindPropObserver extends AttributeObserver {

  constructor (targetNode: any, data: any) {
    super(targetNode, data, 'tb-bind-prop');
    this.observe();
  }

  applyChanges (elements: Element[], data: any) {
    elements.forEach(element => {
      const matches = getValueList(element.getAttribute(this.attributeName))
        .map(({ property, value }) => ({ dataProperty: property, elementProperties: value.split(',')}))

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