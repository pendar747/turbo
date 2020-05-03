import { fire, on } from "../util";

export default class State<StateT, ComputedT> {

  protected _state: StateT;

  protected name: string;

  constructor(name: string, initialState: StateT, protected _computedProperties: string[] = []) {
    this.name = name;
    this._state = initialState;
    this.update(initialState);
  }

  public onUpdated (callback: (newState: StateT) => void) {
    on(`new-state:${this.name}`, (event) => {
      callback(event.detail.state);    
    });
  }

  public update (newSate: StateT) {
    this._state = newSate;
    this.saveStateToSession();
    fire(`new-state:${this.name}`, { state: this._state });
  }

  private saveStateToSession () {
    window.sessionStorage.setItem(`${this.name}-state`, JSON.stringify(this._state));
  }
}