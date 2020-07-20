import { fire } from "../util";
import AttributeObserver from "./AttributeObserver";

interface AttributeObserverWithGetters extends AttributeObserver {
  getters: string[];
}

export default function addNewGetters (this: AttributeObserverWithGetters, getters: string[]) {
  const newGetters = getters
    .map(getter => `${this._model}.${getter}`)
    .filter(getter => !this.getters.includes(getter));

  if (newGetters.length) {
    fire(`${this._stateName}-add-getters`, newGetters);
    this.getters = [...this.getters, ...newGetters];
  }
}
