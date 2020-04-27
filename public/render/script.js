import { State } from '../dist/index.js';

const INITIAL_STATE = {
  person: {
    name: 'James'
  },
  contacts: [{
    name: 'James',
    tel: '0321321234',
    address: '1 Mansion House, long road, NY',
    friends: [{
      name: 'John',
      tel: '0321321234',
      address: '1 Mansion House, long road, NY',
    }, {
      name: 'Mike',
      tel: '0312471234',
      address: '2 Gladiator House, Old Rome road, NY',
    }]
  }, {
    name: 'Dave',
    tel: '0121212234',
    address: '1 , long road, NY'
  }, {
    name: 'Mike',
    tel: '0561241234',
    address: '1 Mansion House, long road, NY'
  }]
}

class AppState extends State {
  constructor () {
    super('my-app', INITIAL_STATE)
  }
}

new AppState();