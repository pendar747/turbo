import { autorun, toJS } from 'https://unpkg.com/mobx@5.15.4/lib/mobx.module.js';

import get from 'lodash-es/get';
import fromPairs from 'lodash-es/fromPairs';
import { MessageData } from './types';

const registerState = (stateName: string) => (StateClass: any) => {
  const state = new StateClass();

  
  let getters: string[] = [];
  
  autorun(() => {
    const data = getters.length 
      ? fromPairs(
        getters.map(property => [property, toJS(get(state, property))])
      )
      : toJS(state);
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