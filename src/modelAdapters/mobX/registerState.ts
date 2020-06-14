import { autorun, toJS, observable } from 'mobx';

import get from 'lodash-es/get';
import set from 'lodash-es/set';
import merge from 'lodash-es/merge';
import has from 'lodash-es/has';
import { MessageData } from './types';

const serialize = (obj: any) => JSON.parse(JSON.stringify(obj));

const registerState = (stateName: string) => (StateClass: any) => {
  const state = new StateClass();

  const getters: any = observable.box([]);
  
  autorun(() => {
    console.log('getters', Array.from(getters.get()));
    let data = getters.get().length ? {} : state;
    getters.get().forEach((property: string) => {
      const value = get(state, property);
      if (!value) {
        return;
      }
      if (has(data, property)) {
        set(data, property, merge(get(data, property), value));
      } else {
        set(data, property, value)
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