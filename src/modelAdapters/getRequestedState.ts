import get from 'lodash-es/get';
import set from 'lodash-es/set';
import mergeWith from 'lodash-es/mergeWith';

const serialize = (obj: any) => JSON.parse(JSON.stringify(obj));

const mergeCustomizer = (obj1: any, obj2: any) => {
  if(Array.isArray(obj1) && Array.isArray(obj2) && obj1.length !== obj2.length) {
    const largerArray = obj1.length > obj2.length ? obj1 : obj2;
    const smallerArray = obj1.length > obj2.length ? obj2 : obj1;
    largerArray.map((item, index) => {
      if (smallerArray[index]) {
        return mergeWith(item, smallerArray[index], mergeCustomizer);
      }
      return item;
    });
  }
  return mergeWith(obj1, obj2);
}

const getRequestedState = (getters: string[], state: { [key in string]: any }) => {
  let data = getters.length ? {} : state;
  // todo move this to a separate module and thoroughly test it
  getters.forEach((property: string) => {
    const value = get(state, property);
    const existingValue = get(data, property);
    if (typeof existingValue == 'object' && typeof value == 'object') {
      set(data, property, mergeWith(existingValue, serialize(value), mergeCustomizer));
    } else if(typeof value == 'object') {
      set(data, property, serialize(value));
    } else {
      set(data, property, value);
    }
  })

  return serialize(data);
};

export default getRequestedState;