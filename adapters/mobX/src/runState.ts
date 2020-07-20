import { on, fire } from "./util";
import { MessageData } from "./types";

/**
 * 
 * @param worker A web worker instance that is running the state
 * @param stateName
 * @returns a promise that resolves when the worker has dispatched the initial state
 */
const runState = (worker: Worker, stateName: string): Promise<Worker> => {
  sessionStorage.clear();

  worker.onerror = (event) => {
    console.error(event.message, event.filename, event.lineno);
  }

  let hasStarted = false;

  on(`${stateName}-add-getters`, (event) => {
    const messageData: MessageData = {
      stateName,
      type: 'getters-update',
      data: event.detail
    }
    worker.postMessage(messageData);
  });

  on(`${stateName}-action`, (event) => {
    const messageData: MessageData = {
      stateName,
      type: 'action',
      actionName: event.detail.actionName,
      data: event.detail.data,
      model: event.detail.model
    }
    worker.postMessage(messageData);
  });

  return new Promise((resolve) => {
    worker.onmessage = (event) => {
      const data: MessageData = event.data;
      if (data.type == 'state-update') {
        if (!hasStarted) {
          hasStarted = true;
          fire(`${stateName}-state-started`);
          resolve(worker);
        }
        sessionStorage.setItem(stateName, JSON.stringify(data.data));
        fire(`${stateName}-state-update`, {
          stateName,
          state: data.data
        });
      }
    }
  });
}

export default runState;