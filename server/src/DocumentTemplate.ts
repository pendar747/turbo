import Template from "./Template";
import { JSDOM } from 'jsdom';
import { Assets } from "./webpack/types";
import path from 'path';

export default class DocumentTemplate extends Template {

  private _dom: JSDOM;
 
  constructor (filePath: string, fileContent: string, templatesPath: string) {
    const dom = new JSDOM(fileContent);
    super(dom.window.document.body, filePath, fileContent, templatesPath);
    this._dom = dom;
    this._content = this._element;
  }

  insertTemplates (templates: Template[]) {
    templates.forEach(template => {
      template.makeAllReferencedTemplatePathsAbsolute();
      this._element.appendChild(template.element);
    })
  }

  insertAssets (assets: Assets) {
    assets
      .filter(asset => path.extname(asset.filename) === '.js')
      .forEach(({ filename }) => {
        const scriptElement = this._dom.window.document.createElement('script');
        scriptElement.src = `/scripts/${filename}`;
        scriptElement.type = 'text/javascript';
        this._element.appendChild(scriptElement);
      });
  }

  toString () {
    return this._dom.serialize();
  }
}