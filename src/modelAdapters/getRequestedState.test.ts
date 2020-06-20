import getRequestedState from "./getRequestedState";

describe('getRequestedState', () => {

  it('should return an object with all the specified getters', () => {
    const state = {
      name: 'steve',
      id: '1421',
      friends: [{
        name: 'james',
        age: 30,
        job: {
          name: 'dentist',
          yearsOfExperience: 5
        },
        children: [{
          name: 'Sarah',
          age: 2
        }, {
          name: 'George',
          age: 1
        }]
      }, {
        name: 'John',
        age: 20,
        job: {
          name: 'engineer',
          yearsOfExperience: 4
        }
      }],
      city: 'London'
    }
    const getters = [
      'name',
      'city',
      'friends[0].age',
      'friends[0].name',
      'friends[1].age',
      'friends[1].name',
      'friends[0].children[0].name'
    ];

    console.log(JSON.stringify(getRequestedState(getters, state)));
    expect(getRequestedState(getters, state)).toEqual({
      "name": "steve",
      "city": "London",
      "friends": [
        {
          "age": 30,
          "name": "james",
          "children": [
            { "name": "Sarah" }
          ]
        },
        { 
          "age": 20, 
          "name": "John" 
        }
      ]
    });
  });
});