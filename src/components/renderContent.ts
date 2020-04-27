import format from 'string-template';
import isNil from 'lodash/isNil';
import mapValues from 'lodash/mapValues';

const findMissingVariables = (text: string, data: any) => {
  const props = text.match(/\{[0-9a-zA-Z]+\}/g) || [];
  return props
    .map(propName => propName.replace(/[\{\}]/g, ''))
    .filter(propName => isNil(data[propName]));
}

export const jsonStringifyForHTML = (item: any) => typeof item === 'object' ? JSON.stringify(item).replace(/"/g, "'") : item; 

export const renderContent = (template: string, as: string) => (item: any): string => {
  const json = jsonStringifyForHTML(item);
  const props = mapValues(item, (value) => {
    return value !== null && typeof value === 'object' ? jsonStringifyForHTML(value) : value;
  })
  let data = { ...props, [as]: json };
  const missingProps = findMissingVariables(template, data);
  missingProps.forEach(propName => {
    data[propName] = `{${propName}}`
  })
  return format(template, data)
}

export const renderContentList = (template: string, as: string) => (items: any[]): string => {
  return items
    .map(renderContent(template, as))
    .join('\n');
}
