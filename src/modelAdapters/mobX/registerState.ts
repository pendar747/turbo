import { autorun, observable } from 'mobx';

import get from 'lodash-es/get';
import { MessageData } from './types';
import getRequestedState from '../getRequestedState';

const registerState = (stateName: string) => (StateClass: any) => {
  const state = new StateClass();

  const getters: any = observable.box([]);
  
  autorun(() => {
    postMessage({
      type: 'state-update',
      stateName,
      data: getRequestedState(getters.get(), state)
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