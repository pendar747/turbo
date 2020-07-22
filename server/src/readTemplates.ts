import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { TemplateMap } from './types';
import { MAIN_TEMPLATE_KEY } from './constants';

const readFile = async (map: TemplateMap, basePath: string, filename: string) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(basePath, filename), (err, result) => {
      if (err) {
        return reject(err);
      }
      const dom = new JSDOM(result);
      // TODO: what happens if template file has more than one unnamed template in it?
      const templates: [string, Element][] = Array.from(dom.window.document.querySelectorAll('template') || [])
        .map(template => [template.id || MAIN_TEMPLATE_KEY, template]);
      map.set(path.join(basePath, filename), new Map(templates));
      resolve();
    });
  });
}

const readDirectory = async (map: TemplateMap, basePath: string, dirName?: string) => {
  const fullPath = dirName ? path.join(basePath, dirName) : basePath;
  const dir = await fs.promises.opendir(fullPath);
  for await (const dirent of dir) {
    if (dirent.isDirectory()) {
      await readDirectory(map, fullPath, dirent.name);
    } else if (dirent.isFile()) {
      await readFile(map, fullPath, dirent.name);
    }
  }
}

const readTemplates = async (templatesPath: string): Promise<TemplateMap> => {
  const map: TemplateMap = new Map();
  await readDirectory(map, templatesPath);
  console.log(map);
  return map;
}

export default readTemplates;