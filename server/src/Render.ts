import { MAIN_TEMPLATE_KEY } from "./constants";
import path from 'path';

export default class Render {
  private element: Element;
  private _templateId: string;
  private _templatePath: string;

  constructor (element: Element) {
    this.element = element;
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
      const templatePath = templateAttr.slice(hashIndex);
      const id = templateAttr.slice(hashIndex + 1);
      return { id, templatePath: templatePath + '.html' };
    }
    return { id: MAIN_TEMPLATE_KEY, templatePath: templateAttr + '.html' };
  }

  get templateId () {
    return this._templateId;
  }

  getTemplatePathRelativeTo (relativePath: string) {
    return path.resolve(path.dirname(relativePath), this._templatePath);
  }
}