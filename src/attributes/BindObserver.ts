import AttributeObserver from "./AttributeObserver";
import getValueList from "./getValueList";
import get from 'lodash-es/get';
import { isNil } from "lodash-es";

class BindObserver extends AttributeObserver {

  constructor (targetNode: any, data: any) {
    super(targetNode, data, 'tb-bind');
    this.observe();
  }

  applyChanges (elements: Element[], data: any) {
    elements.forEach(element => {
      const matches = getValueList(element.getAttribute('tb-bind'))
        .map(({ property, value }) => ({ property, attributeNames: value.split(',')}))

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