import { on, fire } from "../../util";
import { MessageData } from "./types";

const runState = (src: string, stateName: string) => {
  const worker = new Worker(src, { type: 'module' });
  worker.onerror = (event) => {
    console.error(event.message, event.filename, event.lineno);
  }

  worker.onmessage = (event) => {
    const data: MessageData = event.data;
    if (data.type == 'state-update') {
      fire('state-update', {
        stateName,
        state: data.data
      });
    }
  }

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
}

export default runState;