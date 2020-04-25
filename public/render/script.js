import { State } from '../dist/index.js';

const INITIAL_STATE = {
  person: {
    name: 'Foo Bar'
  }
}

class AppState extends State {
  constructor () {
    super('my-app', INITIAL_STATE)
  }
}

new AppState();