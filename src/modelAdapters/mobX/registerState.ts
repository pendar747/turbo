import { autorun, observable } from 'mobx';

import get from 'lodash-es/get';
import set from 'lodash-es/set';
import mergeWith from 'lodash-es/mergeWith';
import { MessageData } from './types';

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

const registerState = (stateName: string) => (StateClass: any) => {
  const state = new StateClass();

  const getters: any = observable.box([]);
  
  autorun(() => {
    let data = getters.get().length ? {} : state;
    // todo move this to a separate module and thoroughly test it
    getters.get().forEach((property: string) => {
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
    postMessage({
      type: 'state-update',
      stateName,
      data: serialize(data)
    } as MessageData);
  });

  onmessage = (event: MessageEvent) => {
    const { actionName, data, model, stateName: messageStateName, type }: MessageData = event.data;
    if (type == 'action' && messageStateName == stateName && actionName) {
      const modelObject = model ? get(state, model) : state;
      const actionFunction: Function = get(modelObject, actionName);
      if (actionFunction) {
        actionFunction.call(modelObject, data);
      }
    }
    if (type == 'getters-update') {
      const newGetters = (data as string[])
        .filter(getter => !getters.get().includes(getter));
      if (newGetters.length) {
        getters.set([...getters.get(), ...newGetters]);
      }
    }
  }
}

export default registerState;