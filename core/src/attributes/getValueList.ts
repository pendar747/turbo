const pattern = /([A-Za-z0-9_]*):([A-Za-z0-9-,]*)/;

const getValueList = (attributeValue?: string|null): { property: string, value: string }[] => {
  const parts = attributeValue ? attributeValue.split(';') : [];
  const matches = parts
    .map(parts => {
      const match = parts.match(pattern);
      return match ? { property: match[1], value: match[2] }: undefined
    })
    .filter(value => value != undefined) as { property: string, value: string }[];
  return matches;
}

export default getValueList;