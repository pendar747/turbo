import { autorun, toJS } from 'https://unpkg.com/mobx@5.15.4/lib/mobx.module.js';

import get from 'lodash-es/get';
import set from 'lodash-es/set';
import merge from 'lodash-es/merge';
import has from 'lodash-es/has';
import { MessageData } from './types';

const registerState = (stateName: string) => (StateClass: any) => {
  const state = new StateClass();

  
  let getters: string[] = [];
  
  autorun(() => {
    let data = getters.length ? {} : toJS(state);
    getters.forEach(property => {
      const value = toJS(get(state, property));
      if (has(data, property)) {
        set(data, property, merge(value, get(data, property)));
      } else {
        set(data, property, value)
      }
    })
    postMessage({
      type: 'state-update',
      stateName,
      data
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
      getters = data;
    }
  }
}

export default registerState;