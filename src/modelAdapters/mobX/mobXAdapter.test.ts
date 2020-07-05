import runState from "./runState";
import { fire, on } from "../../util";
import { waitUntil } from "@open-wc/testing-helpers";

describe('mobXAdapter', () => {

  let originalTimeout: number;
  beforeAll(() => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  let worker: Worker;
  let onStateUpdate: jasmine.Spy;
  beforeEach(async () => {
    onStateUpdate = jasmine.createSpy();
    on('app-state-update', onStateUpdate);
    worker = new Worker('/base/dist/modelAdapters/mobX/sampleState.js', { type: 'module' });
    await runState(worker, 'app');
  });

  afterEach(() => {
    worker.terminate();
  });

  it('should fire an initial state update', async () => {
    await waitUntil(() => onStateUpdate.calls.count() == 1);
    expect(JSON.parse(sessionStorage.getItem('app') ?? '{}')).toEqual({
      todos: []
    });
    expect(onStateUpdate.calls.argsFor(0)[0].detail).toEqual({
      stateName: 'app',
      state: {
        todos: []
      }
    });
  });

  it('should start a mobX state in a webworker', async () => {
    fire('app-action', {
      actionName: 'addTodo',
      data: {
        text: 'My todo'
      }
    });

    await waitUntil(() => onStateUpdate.calls.count() == 2);

    expect(JSON.parse(sessionStorage.getItem('app') ?? '{}')).toEqual({
      todos: [{ text: 'My todo' }]
    });
    expect(onStateUpdate.calls.argsFor(1)[0].detail).toEqual({
      stateName: 'app',
      state: {
        todos: [{ text: 'My todo' }]
      }
    });
  });

  it('should update a model in the state', async () => {
    fire('app-action', {
      actionName: 'addTodo',
      data: {
        text: 'My todo'
      }
    });
    fire('app-action', {
      model: 'todos[0]',
      actionName: 'edit',
      data: {
        text: 'Something else'
      }
    });

    await waitUntil(() => onStateUpdate.calls.count() == 3);

    expect(JSON.parse(sessionStorage.getItem('app') ?? '{}')).toEqual({
      todos: [{ text: 'Something else' }]
    });
    expect(onStateUpdate.calls.argsFor(2)[0].detail).toEqual({
      stateName: 'app',
      state: {
        todos: [{ text: 'Something else' }]
      }
    });
  });

  describe('getters', () => {

    beforeEach( async () => {
      fire('app-action', {
        actionName: 'addTodo',
        data: {
          text: 'My todo'
        }
      });
      fire('app-action', {
        actionName: 'addTodo',
        data: {
          text: 'Another todo'
        }
      });
    });

    it('should expose computed properties', async () => {
      fire('app-add-getters', ['todos', 'allTodosSummary']);
      await waitUntil(() => onStateUpdate.calls.count() == 4);

      expect(JSON.parse(sessionStorage.getItem('app') ?? '{}')).toEqual({
        todos: [{ text: 'My todo' }, { text: 'Another todo' }],
        allTodosSummary: 'My todo, Another todo'
      });
      expect(onStateUpdate.calls.argsFor(3)[0].detail).toEqual({
        stateName: 'app',
        state: {
          todos: [{ text: 'My todo' }, { text: 'Another todo' }],
          allTodosSummary: 'My todo, Another todo'
        }
      });
    });

    it('should handle nested computed properties', async () => {
      fire('app-add-getters', ['todos[0].quotedText', 'todos', 'allTodosSummary']);
      await waitUntil(() => onStateUpdate.calls.count() == 4);
      
      expect(JSON.parse(sessionStorage.getItem('app') ?? '{}')).toEqual({
        todos: [{ text: 'My todo', quotedText: '"My todo"' }, { text: 'Another todo' }],
        allTodosSummary: 'My todo, Another todo'
      });
      expect(onStateUpdate.calls.argsFor(3)[0].detail).toEqual({
        stateName: 'app',
        state: {
          todos: [{ text: 'My todo', quotedText: '"My todo"' }, { text: 'Another todo' }],
          allTodosSummary: 'My todo, Another todo'
        }
      });
    });

    it('should accumulate multiple getters that are added by different events', async () => {
      fire('app-add-getters', ['todos[0].quotedText', 'todos', 'allTodosSummary']);
      fire('app-add-getters', ['todos[1].quotedText']);
      await waitUntil(() => onStateUpdate.calls.count() == 5);

      const expectedState = {
        todos: [{ text: 'My todo', quotedText: '"My todo"' }, { text: 'Another todo', quotedText: '"Another todo"' }],
        allTodosSummary: 'My todo, Another todo'
      };
      expect(JSON.parse(sessionStorage.getItem('app') ?? '{}')).toEqual(expectedState);
      expect(onStateUpdate.calls.argsFor(4)[0].detail).toEqual({
        stateName: 'app',
        state: expectedState
      })
    });

  });

});