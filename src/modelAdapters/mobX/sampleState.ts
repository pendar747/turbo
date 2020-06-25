import { observable, action, computed } from 'https://unpkg.com/mobx@5.15.4/lib/mobx.module.js';
import registerState from './registerState';

class Todo {
  @observable
  text: string = '';  

  constructor (text: string) {
    this.text = text;
  }

  @computed
  get quotedText () {
    return `"${this.text}"`;
  }

  @action
  edit ({ text }: { text: string }) {
    this.text = text;
  }
}

@registerState('app')
export default class MainState {
  @observable
  todos: Todo[] = [];

  @computed
  get allTodosSummary () {
    return this.todos.map(({ text }) => text).join(', ');
  }
  
  @action
  addTodo ({ text }: { text: string }) {
    this.todos.push(new Todo(text));
  }
}