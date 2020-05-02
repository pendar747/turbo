import format from 'string-template';
import isNil from 'lodash/isNil';
import mapValues from 'lodash/mapValues';

const templatePattern = new RegExp(/\{\s?([0-9a-zA-Z]+)\s?\}/g);

// TODO: write own rendering replacement to have better control
// currently array properties are not replaced (e.g. Array.length)
export const jsonStringifyForHTML = (item: any) => typeof item === 'object' ? JSON.stringify(item).replace(/"/g, "'") : item; 

interface MatchRange { 
  propName: string, 
  range: [number, number]
};

const replaceMatches = (charList: string[], matchRanges: MatchRange[], data: any): string => {
  let skipIndex: number = 0;
  const newCharList = matchRanges.reduce((acc, { range, propName }) => {
    const newAcc = [
      ...acc.slice(0, range[0] + skipIndex),
      data[propName],
      ...acc.slice(range[1] + skipIndex)
    ];
    skipIndex += 1 - (range[1] - range[0]);
    return newAcc;
  }, charList as string[]);
  return newCharList.join('');
}

export const renderContent = (template: string) => {

  const matches = template.matchAll(templatePattern);
  const matchRanges: MatchRange[] = [];
  for (const match of matches) {
    if (match.length >= 2 && match.index !== undefined) {
      const propName = match[1];
      matchRanges.push({ propName, range: [match.index, match.index + match[0].length] })
    }
  }
  const charList = template.split('');

  return (item: any): string => {
    const json = jsonStringifyForHTML(item);
    const props = mapValues(item, (value) => {
      return value !== null && typeof value === 'object' ? jsonStringifyForHTML(value) : value;
    })
    let data: any = { ...props, 'this': json };
    return replaceMatches(charList, matchRanges, data);
  }
}
