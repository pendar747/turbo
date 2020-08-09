import { JSDOM } from 'jsdom';
import { match } from 'path-to-regexp';
import Render from './Render';
import { MAIN_TEMPLATE_KEY } from './constants';
import path from 'path';

export default class Template {

  protected _element: Element;
  protected _content: Element;
  protected _filePath: string;
  protected _fileContent: string;
  protected _templatesPath: string;

  constructor (element: Element, filePath: string, fileContent: string, templatesPath: string) {
    this._filePath = filePath;
    this._templatesPath = templatesPath;
    this._element = element;
    this._fileContent = fileContent;
    this._content = new JSDOM(`<div class="template">${element.innerHTML}</div>`)
      .window.document.querySelector('.template') as Element
  }

  get element () {
    const element = new JSDOM().window.document.createElement('template');
    element.setAttribute('path', this.filePathRelativeToTemplatesPath);
    element.setAttribute('id', this.id);
    element.innerHTML = this._content.innerHTML;
    return element;
  }

  get filePath () {
    return this._filePath;
  }

  get id () {
    return this._element.id || MAIN_TEMPLATE_KEY;
  }

  private getRouteElementMatchingPath (path: string): Element|undefined {
    const routeElements = Array.from(this._content.querySelectorAll('px-route') || []);
    const matchingRoute = routeElements.find(element => {
      const pathAttr = element.getAttribute('path');
      if (!pathAttr) {
        return false;
      }
      return match(pathAttr, { end: false })(path);
    });
    return matchingRoute;
  }

  private getNonRouteRenderElements (): Element[] {
    const allRouteRenders = Array.from(this._content.querySelectorAll('px-route px-render') || []);
    const allRenders = Array.from(this._content.querySelectorAll('px-render') || []);
    return allRenders.filter(element => !allRouteRenders.includes(element));
  }

  private getRenderElementsMatchingPath (path: string): Element[] {
    const routeElement = this.getRouteElementMatchingPath(path);
    if (!routeElement) {
      return [];
    }
    return Array.from(routeElement.querySelectorAll('px-render') || []);
  }

  getAllRenderElementsMatchingPath (path: string): Render[] {
    const routeElementRenders = this.getRenderElementsMatchingPath(path);
    const nonRouteRenders = this.getNonRouteRenderElements();
    const allElements =  [...routeElementRenders, ...nonRouteRenders];
    return allElements.map(element => new Render(element, this._filePath, this._templatesPath));
  }

  getAllRenders (): Render[] {
    const allRenders = Array.from(this._content.querySelectorAll('px-render') || []);
    return allRenders.map(element => new Render(element, this._filePath, this._templatesPath));
  }

  makeAllReferencedTemplatePathsAbsolute () {
    this.getAllRenders()
      .forEach(render => render.makeTemplatePathsAbsolute());
  }

  private get filePathRelativeToTemplatesPath () {
    const { dir, name } = path.parse(this.filePath.slice(this._templatesPath.length));
    return path.join(dir, name);
  }

  toString () {
    return this.element.outerHTML;
  }
}