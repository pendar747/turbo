import { on, fire } from "../../util";
import { MessageData } from "./types";

const runState = (worker: Worker, stateName: string): Worker => {
  worker.onerror = (event) => {
    console.error(event.message, event.filename, event.lineno);
  }

  worker.onmessage = (event) => {
    const data: MessageData = event.data;
    if (data.type == 'state-update') {
      sessionStorage.setItem(stateName, JSON.stringify(data.data));
      fire(`${stateName}-state-update`, {
        stateName,
        state: data.data
      });
    }
  }

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

  fire(`${stateName}-state-started`);

  return worker;
}

export default runState;