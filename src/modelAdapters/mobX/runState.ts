import { on, fire } from "../../util";
import { MessageData } from "./types";

const runState = (src: string, stateName: string): Worker => {
  const worker = new Worker(src, { type: 'module' });
  worker.onerror = (event) => {
    console.error(event.message, event.filename, event.lineno);
  }

  worker.onmessage = (event) => {
    const data: MessageData = event.data;
    if (data.type == 'state-update') {
      localStorage.setItem(stateName, JSON.stringify(data.data));
      fire('state-update', {
        stateName,
        state: data.data
      });
    }
  }

  on(`${stateName}-getters-update`, (event) => {
    const messageData: MessageData = {
      stateName,
      type: 'getters-update',
      data: event.detail
    }
    worker.postMessage(messageData);
  });

  on('action', (event) => {
    const messageData: MessageData = {
      stateName,
      type: 'action',
      actionName: event.detail.actionName,
      data: event.detail.data,
      model: event.detail.model
    }
    worker.postMessage(messageData);
  });

  return worker;
}

export default runState;