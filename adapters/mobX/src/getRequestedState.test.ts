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

  it('should omit properties that are null or undefined', () => {
    const state = {
      name: 'steve',
      id: '1421',
      friends: [{
        name: 'james',
        age: 30,
        job: {
          name: 'dentist',
          yearsOfExperience: 5
        }
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

    expect(getRequestedState(getters, state)).toEqual({
      "name": "steve",
      "city": "London",
      "friends": [
        {
          "age": 30,
          "name": "james"
        },
        {
          "age": 20,
          "name": "John"
        }
      ]
    });
    
  });

  it('should serialize and return a class based state', () => {
    class TodoList {
      isSelected: boolean = false;
      name: string = '';
      description: string = '';
      date: Date;
      id: string;
      isDeleted: boolean = false;

      constructor(props: { name: string, id: string, date: Date, description: string }) {
        this.name = props.name;
        this.id = props.id;
        this.date = props.date;
        this.description = props.description;
      }
    }

    class ListCollection {
      name = '';

      description = '';

      allLists: TodoList[] = [];

      async addTodoList() {
        const list = new TodoList({
          name: this.name,
          id: this.allLists.length.toString(),
          date: new Date(),
          description: this.description
        });
        this.allLists.push(list)
        this.description = '';
        this.name = '';
      }

      setName({ value }: { value: string }) {
        this.name = value;
      }

      setDescription({ value }: { value: string }) {
        this.description = value;
      }

      get visibleLists() {
        return this.allLists.filter(list => !list.isDeleted);
      }

      get deletedLists() {
        return this.allLists.filter(list => list.isDeleted);
      }

      async clearAlDeletedLists() {
        this.allLists = this.visibleLists;
      }

      get selectedList() {
        return this.allLists.find(list => list.isSelected);
      }
    }

    class State {
      lists: ListCollection = new ListCollection();

      list: TodoList | null = null;
    }

    const state = new State();
    state.lists.name = 'My todo list',
      state.lists.description = 'My description';
    state.lists.addTodoList();

    const getters = ['lists.visibleLists[0].name', 'lists.visibleLists[0].description', 'lists.name', 'lists.description'];

    expect(getRequestedState(getters, state)).toEqual({
      "lists": {
        "visibleLists": [{ 
          "name": "My todo list", 
          "description": "My description" 
        }], 
        "name": "", 
        "description": ""
      }
    });
  });
});