import { fire, on } from "../util";
import get from "lodash/get";
import fromPairs from 'lodash/fromPairs';

export default class State<StateT, ComputedT> {

  protected _state: StateT;

  protected name: string;

  get allState ():  StateT & { computed :ComputedT } {
    const computed: ComputedT = fromPairs(this._computedProperties
      .map(propertyName => [propertyName, get(this, propertyName)])) as ComputedT;
    return { ...this._state, computed };
  }

  constructor(name: string, initialState: StateT, protected _computedProperties: string[] = []) {
    this.name = name;
    this._state = initialState;
    this.update(initialState);
  }

  update (newSate: StateT) {
    this._state = newSate;
    this.saveStateToSession();
    console.log(`${this.name}-state-update`.toUpperCase(), { state: this.allState })
    fire(`${this.name}-state-update`, { state: this.allState });
  }

  private saveStateToSession () {
    window.sessionStorage.setItem(`${this.name}-state`, JSON.stringify(this.allState));
  }
 
  get current (): StateT {
    return { ...this._state };
  }
}