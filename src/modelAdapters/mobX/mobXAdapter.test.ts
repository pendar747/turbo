import runState from "./runState";
import { fire, on } from "../../util";
import { waitUntil } from "@open-wc/testing-helpers";

describe('mobXAdapter', () => {

  let originalTimeout: number;
  beforeAll(() => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000; 
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  let worker: Worker;

  beforeEach(() => {
    worker = runState('/base/dist/modelAdapters/mobX/sampleState.js', 'main');
  });

  afterEach(() => {
    worker.terminate();
  });

  it('should fire an initial state update', async () => {
    const onStateUpdate = jasmine.createSpy();
    on('state-update', onStateUpdate);

    await waitUntil(() => onStateUpdate.calls.count() == 1);
    expect(JSON.parse(localStorage.getItem('main') ?? '{}')).toEqual({
      todos: []
    });
    expect(onStateUpdate.calls.argsFor(0)[0].detail).toEqual({
      stateName: 'main',
      state: {
        todos: []
      }
    });
  });

  it('should start a mobX state in a webworker', async () => {
    const onStateUpdate = jasmine.createSpy();
    on('state-update', onStateUpdate);
    fire('action', {
      actionName: 'addTodo',
      data: {
        text: 'My todo'
      }
    });

    await waitUntil(() => onStateUpdate.calls.count() == 2);

    expect(JSON.parse(localStorage.getItem('main') ?? '{}')).toEqual({
      todos: [{ text: 'My todo' }]
    });
    expect(onStateUpdate.calls.argsFor(1)[0].detail).toEqual({
      stateName: 'main',
      state: {
        todos: [{ text: 'My todo' }]
      }
    });
  });
  
  it('should update a model in the state', async () => {
    const onStateUpdate = jasmine.createSpy();
    on('state-update', onStateUpdate);
    fire('action', {
      actionName: 'addTodo',
      data: {
        text: 'My todo'
      }
    });
    fire('action', {
      model: 'todos[0]',
      actionName: 'edit',
      data: {
        text: 'Something else'
      }
    });

    await waitUntil(() => onStateUpdate.calls.count() == 3);

    expect(JSON.parse(localStorage.getItem('main') ?? '{}')).toEqual({
      todos: [{ text: 'Something else' }]
    });
    expect(onStateUpdate.calls.argsFor(2)[0].detail).toEqual({
      stateName: 'main',
      state: {
        todos: [{ text: 'Something else' }]
      }
    });
  });
  
  it('should expose computed properties', async () => {
    const onStateUpdate = jasmine.createSpy();
    fire('main-getters-update', ['todos', 'allTodosSummary']);
    on('state-update', onStateUpdate);
    fire('action', {
      actionName: 'addTodo',
      data: {
        text: 'My todo'
      }
    });
    fire('action', {
      actionName: 'addTodo',
      data: {
        text: 'Another todo'
      }
    });

    await waitUntil(() => onStateUpdate.calls.count() == 3);

    expect(JSON.parse(localStorage.getItem('main') ?? '{}')).toEqual({
      todos: [{ text: 'My todo' }, { text: 'Another todo' }],
      allTodosSummary: 'My todo, Another todo'
    });
    expect(onStateUpdate.calls.argsFor(2)[0].detail).toEqual({
      stateName: 'main',
      state: {
        todos: [{ text: 'My todo' }, { text: 'Another todo' }],
        allTodosSummary: 'My todo, Another todo'
      }
    });
  });
});