import { observable, action } from 'https://unpkg.com/mobx@5.15.4/lib/mobx.module.js';
import registerState from './registerState';

@registerState('main')
export default class MainState {
  @observable
  todos: string[] = [];
  

  @action
  addTodo ({ text }: { text: string }) {
    this.todos.push(text);
  }
}