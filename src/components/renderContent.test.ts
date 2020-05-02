import { renderContent } from "./renderContent";

describe('render content', () => {

  it('should render content with templates', () => {
    const template = 'My name is {name} and I live in {city} and I love {food}.';
    const output = renderContent(template)({ name: 'John', city: 'London', food: 'pancakes' });
    expect(output).toBe('My name is John and I live in London and I love pancakes.');
  });
  
  it('should render content with templates with multiple lines', () => {
    const template = `My name is {name} 
    and I live in {city} 
    and I love {food}.`;
    const output = renderContent(template)({ name: 'John', city: 'London', food: 'pancakes' });
    expect(output).toBe(`My name is John 
    and I live in London 
    and I love pancakes.`);
  });

  it('should be forgiving with spaces in template prop names', () => {
    const template = 'My name is { name} and I live in { city } and I love {food}.';
    const output = renderContent(template)({ name: 'John', city: 'London', food: 'pancakes' });
    expect(output).toBe('My name is John and I live in London and I love pancakes.');
  });
  
  it('should replace multiple instances of a property', () => {
    const template = 'My name is { name} and my friend is also called {name}.';
    const output = renderContent(template)({ name: 'John', city: 'London', food: 'pancakes' });
    expect(output).toBe('My name is John and my friend is also called John.');
  });
  
  it('should print the keyword "this" as html friendly json', () => {
    const template = '<span>{name}</span><tb-render template="template-id" value="{this}"></tb-render>';
    const output = renderContent(template)({ name: 'John', city: 'London', food: 'pancakes' });
    expect(output).toBe('<span>John</span><tb-render template="template-id" value="{\'name\':\'John\',\'city\':\'London\',\'food\':\'pancakes\'}"></tb-render>');
  });

  it('should omit null and undefined property values', () => {
    const template = 'My name is {name} and I live in {city} and I love {food}.';
    const output = renderContent(template)({ name: null, city: 'London' });
    expect(output).toBe('My name is  and I live in London and I love .');
  })
});