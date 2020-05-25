import runState from "./runState";
import { fire, on } from "../../util";
import { waitUntil } from "@open-wc/testing-helpers";

describe('mobXAdapter', () => {

  it('should start a mobX state in webworker', async () => {
    runState('/base/dist/modelAdapters/mobX/sampleState.js', 'main');
    const onStateUpdate = jasmine.createSpy();
    on('state-update', onStateUpdate);
    fire('action', {
      actionName: 'addTodo',
      data: {
        text: 'My todo'
      }
    });

    await waitUntil(() => onStateUpdate.calls.count() == 2);

    expect(onStateUpdate.calls.argsFor(1)[0].detail).toEqual({
      stateName: 'main',
      state: {
        todos: ['My todo']
      }
    });
  });
});