import fs from 'fs';
import path from 'path';
import { TemplateMap } from './types';
import TemplateFile from './TemplateFile';


const readFile = async (map: TemplateMap, basePath: string, filename: string) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(basePath, filename);
    fs.readFile(filePath, { encoding: 'utf-8' }, (err, result) => {
      if (err) {
        return reject(err);
      }
      map.set(filePath, new TemplateFile(filePath, result));
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
  return map;
}

export default readTemplates;