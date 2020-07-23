import { JSDOM } from 'jsdom';
import { match } from 'path-to-regexp';
import Render from './Render';

export default class Template {

  protected element: Element;
  protected _content: Element;
  protected _filePath: string;
  protected _fileContent: string;

  constructor (element: Element, filePath: string, fileContent: string) {
    this._filePath = filePath;
    this.element = element;
    this._fileContent = fileContent;
    this._content = new JSDOM(`<div class="template">${element.innerHTML}</div>`)
      .window.document.querySelector('.template') as Element
  }

  get filePath () {
    return this._filePath;
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
    return allElements.map(element => new Render(element, this._filePath));
  }

  toString () {
    return this.element.outerHTML;
  }
}