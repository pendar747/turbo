import { autorun, toJS } from 'https://unpkg.com/mobx@5.15.4/lib/mobx.module.js';

import get from 'lodash-es/get';
import { MessageData } from './types';

const registerState = (stateName: string) => (StateClass: any) => {
  const state = new StateClass();
  
  autorun(() => {
    postMessage({
      type: 'state-update',
      stateName,
      data: toJS(state)
    } as MessageData);
  });

  onmessage = (event: MessageEvent) => {
    const { actionName, data, model, stateName: messageStateName, type }: MessageData = event.data;
    if (type == 'action' && messageStateName == stateName && actionName) {
      const actionFunction: Function = model
        ? get(state, `${model}.${actionName}`)
        : get(state, actionName);
      if (actionFunction) {
        actionFunction.call(state, data);
      }
    }
  }
}

export default registerState;