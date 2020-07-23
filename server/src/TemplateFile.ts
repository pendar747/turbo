import { JSDOM } from 'jsdom';
import { MAIN_TEMPLATE_KEY } from './constants';
import Template from './Template';

export default class TemplateFile {

  private _templates: Map<string, Template>;
  private _filePath: string;
  private _fileContent: string;


  constructor (path: string, fileContent: string) {
    this._filePath = path; 
    this._fileContent = fileContent;
    const dom = new JSDOM(fileContent);
    // TODO: what happens if template file has more than one unnamed template in it?
    this._templates = new Map(Array.from(dom.window.document.querySelectorAll('template') || [])
      .map(template => {
        const id = template.id || MAIN_TEMPLATE_KEY;
        return [id, new Template(template, this._filePath)];
      })
    );
  }

  getTemplate (path: string) {
    return this._templates.get(path);
  }
  
}