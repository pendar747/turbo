import { MAIN_TEMPLATE_KEY } from "./constants";
import path from 'path';

export default class Render {
  private element: Element;
  private _templateId: string;
  private _templatePath: string;
  private _filePath: string;
  private _templatesPath: string;

  constructor (element: Element, filePath: string, templatesPath: string) {
    this._templatesPath = templatesPath;
    this.element = element;
    this._filePath = filePath;
    const { id, templatePath } = this.getPathAndId(); 
    this._templateId = id;
    this._templatePath = templatePath;
  }

  private get absoluteTemplatePath () {
    return this.templateUrlPath + `#${this.templateId}`;
  }

  makeTemplatePathsAbsolute () {
    this.element.setAttribute('template', this.absoluteTemplatePath);
  }
  
  private getPathAndId () {
    const templateAttr = this.element.getAttribute('template');
    if (!templateAttr) {
      throw new Error(`No template attribute defined by ${this.element.outerHTML}`);
    }
    const hashIndex = templateAttr.indexOf('#');
    if (hashIndex >= 0) {
      const id = templateAttr.slice(hashIndex + 1);
      const templatePathPart = templateAttr.slice(0, hashIndex);
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
    const pathWithExt = path.resolve(path.dirname(this._filePath), this._templatePath);
    const { dir, name } = path.parse(pathWithExt);
    return path.join(dir, name);
  }

  get templateUrlPath () {
    const rawPath = this._templatesPath.length > this.fullPath.length 
        ? this.fullPath
        : this.fullPath.slice(this._templatesPath.length);
    return rawPath.indexOf('/templates') == 0 ? rawPath : path.join('/templates', rawPath);
  }

}