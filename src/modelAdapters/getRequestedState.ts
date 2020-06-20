import get from 'lodash-es/get';
import set from 'lodash-es/set';
import merge from 'lodash-es/merge';

const serialize = (obj: any) => JSON.parse(JSON.stringify(obj));

const getRequestedState = (getters: string[], state: { [key in string]: any }) => {
  let data = getters.length ? {} : state;
  getters.forEach((property: string) => {
    const newData = {};
    const value = get(state, property);
    const serializedValue = typeof value === 'object' ? serialize(value) : value;
    set(newData, property, serializedValue);
    data = merge(data, newData);
  })

  return serialize(data);
};

export default getRequestedState;