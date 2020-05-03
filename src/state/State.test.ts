import State from './State';
import { fire, on } from '../util';

describe('State', () => {

  it('should allow creating a state', () => {
    const state = new State('my-app-state', { name: 'Pete', lastName: 'Johnson' });
    expect(state).toBeInstanceOf(State);
  });

  it('should be updated through an event', async () => {
    const state = new State('my-app-state', { name: '', lastName: '' });
    const promise = new Promise((resolve) => {
      state.onUpdated((newState) => {
        expect(newState).toEqual({ name: 'Pete', lastName: 'Johnson' });
        resolve();
      });
    });
    state.update({ name: 'Pete', lastName: 'Johnson' });
    return promise;
  });
});