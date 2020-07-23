import { MAIN_TEMPLATE_KEY } from "./constants";
import path from 'path';

export default class Render {
  private element: Element;
  private _templateId: string;
  private _templatePath: string;
  private _filePath: string;

  constructor (element: Element, filePath: string) {
    this.element = element;
    this._filePath = filePath;
    const { id, templatePath } = this.getPathAndId(); 
    this._templateId = id;
    this._templatePath = templatePath;
  }
  
  private getPathAndId () {
    const templateAttr = this.element.getAttribute('template');
    if (!templateAttr) {
      throw new Error(`No template attribute defined by ${this.element.outerHTML}`);
    }
    const hashIndex = templateAttr.indexOf('#');
    if (hashIndex >= 0) {
      const templatePathPart = templateAttr.slice(0, hashIndex);
      const id = templateAttr.slice(hashIndex + 1);
      const templatePath = templatePathPart.length > 0 
        ? templatePathPart + '.html' 
        : this._filePath; 
      return { id, templatePath };
    }
    return { id: MAIN_TEMPLATE_KEY, templatePath: templateAttr + '.html' };
  }

  get templateId () {
    return this._templateId;
  }

  get fullPath () {
    return path.resolve(path.dirname(this._filePath), this._templatePath);
  }

}