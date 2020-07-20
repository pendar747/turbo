import parseTemplate from "./parseTemplate";

describe('render content', () => {
  it('should render content with templates', () => {
    const template = 'My name is {name} and I live in {city} and I love {food}.';
    const output = parseTemplate(template).render({ name: 'John', city: 'London', food: 'pancakes' });
    expect(output).toBe('My name is John and I live in London and I love pancakes.');
  });
  
  it('should render content with templates with multiple lines', () => {
    const template = `My name is {name} 
    and I live in {city} 
    and I love {food}.`;
    const output = parseTemplate(template).render({ name: 'John', city: 'London', food: 'pancakes' });
    expect(output).toBe(`My name is John 
    and I live in London 
    and I love pancakes.`);
  });

  it('should be forgiving with spaces in template prop names', () => {
    const template = 'My name is { name} and I live in { city } and I love {food}.';
    const output = parseTemplate(template).render({ name: 'John', city: 'London', food: 'pancakes' });
    expect(output).toBe('My name is John and I live in London and I love pancakes.');
  });
  
  it('should replace multiple instances of a property', () => {
    const template = 'My name is { name} and my friend is also called {name}.';
    const output = parseTemplate(template).render({ name: 'John', city: 'London', food: 'pancakes' });
    expect(output).toBe('My name is John and my friend is also called John.');
  });
  
  it('should print the keyword "this" as html friendly json', () => {
    const template = '<span>{name}</span><px-render template="template-id" value="{this}"></px-render>';
    const output = parseTemplate(template).render({ name: 'John', city: 'London', food: 'pancakes' });
    expect(output).toBe('<span>John</span><px-render template="template-id" value="{\'name\':\'John\',\'city\':\'London\',\'food\':\'pancakes\'}"></px-render>');
  });
  
  it('should print an object property as html friendly json', () => {
    const template = '<span>{name}</span><px-render template="template-id" value="{stuff}"></px-render>';
    const output = parseTemplate(template).render({ name: 'John', city: 'London', stuff: { food: 'pancakes', desert: 'cheese' } });
    expect(output).toBe('<span>John</span><px-render template="template-id" value="{\'food\':\'pancakes\',\'desert\':\'cheese\'}"></px-render>');
  });

  it('should omit null and undefined property values', () => {
    const template = 'My name is {name} and I live in {city} and I love {food}.';
    const output = parseTemplate(template).render({ name: null, city: 'London' });
    expect(output).toBe('My name is  and I live in London and I love .');
  });

  it('should replace array properties', () => {
    const template = 'My name is {name} and I have {friends.length} friends.';
    const output = parseTemplate(template).render({ name: 'Pete', friends: ['Alex', 'Dave'] });
    expect(output).toBe('My name is Pete and I have 2 friends.');
  });
  
  it('should print an item of an array', () => {
    const template = 'My name is {name} and {friends[0]} is my best mate.';
    const output = parseTemplate(template).render({ name: 'James', friends: ['Alex', 'Dave'] });
    expect(output).toBe('My name is James and Alex is my best mate.');
  });
  
  it('should print an nested properties', () => {
    const template = 'My name is {name} and {friends[0].lastName} is my best mate.';
    const output = parseTemplate(template).render({ name: 'James', friends: [{ lastName: 'Barkinsov', firstname: 'Sash' }, 'Dave'] });
    expect(output).toBe('My name is James and Barkinsov is my best mate.');
  });
  
  it('should return a list of property names', () => {
    const template = 'My name is {name} and I live in {city} and I love {food}.';
    const output = parseTemplate(template);
    expect(output.getters).toEqual(['name', 'city', 'food']);
  });
});