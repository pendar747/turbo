import mapValues from 'lodash/mapValues';
import get from 'lodash/get';

const templatePattern = new RegExp(/\{\s?([0-9a-zA-Z\.\[\]]+)\s?\}/g);

export const jsonStringifyForHTML = (item: any) => typeof item === 'object' ? JSON.stringify(item).replace(/"/g, "'") : item; 

interface MatchRange { 
  propName: string, 
  range: [number, number]
};

const replaceMatches = (charList: string[], matchRanges: MatchRange[], data: any): string => {
  let skipIndex: number = 0;
  const newCharList = matchRanges.reduce((acc, { range, propName }) => {
    const raw = get(data, propName)
    const value = raw !== null && typeof raw === 'object' ? jsonStringifyForHTML(raw) : raw;
    const newAcc = [
      ...acc.slice(0, range[0] + skipIndex),
      value,
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
    let data: any = { ...item, 'this': json };
    return replaceMatches(charList, matchRanges, data);
  }
}
