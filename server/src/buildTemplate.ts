import { TemplateMap } from "./types";
import path from 'path';
import { match } from 'path-to-regexp';
import { MAIN_TEMPLATE_KEY } from "./constants";

const findMatchingRouteElement = (templateElement: Element, routePath: string): Element | undefined => {
  const routeElements = Array.from(templateElement.querySelectorAll('px-route') || []);
  const matchingRoute = routeElements.find(element => {
    const pathAttr = element.getAttribute('path');
    if (!pathAttr) {
      return false;
    }
    return match(pathAttr, { end: false })(routePath);
  });
  return matchingRoute;
}

const getNonRouteRenders = (templateElement: Element) => {
  const allRouteRenders = Array.from(templateElement.querySelectorAll('px-route px-render') || []);
  const allRenders = Array.from(templateElement.querySelectorAll('px-render') || []);
  return allRenders.filter(element => !allRouteRenders.includes(element));
}

const getPathAndId = (templateFullPath: string) => {
  const hashIndex = templateFullPath.indexOf('#');
  if (hashIndex >= 0) {
    const templatePath = templateFullPath.slice(hashIndex);
    const id = templateFullPath.slice(hashIndex + 1);
    return { id, templatePath: templatePath + '.html' };
  }
  return { id: MAIN_TEMPLATE_KEY, templatePath: templateFullPath + '.html' };
}

const getTemplateElement = (templateMap: TemplateMap, templatePath: string, id: string): Element => {
  const pathMap = templateMap.get(templatePath);
  if (!pathMap) {
    throw new Error(`No template at ${templatePath}`);
  }
  const element = pathMap.get(id);
  if (!element) {
    throw new Error(`No elements with id ${id} defined in ${templatePath}`)
  }
  return element;
}

const getTemplates = (routePath: string, templateMap: TemplateMap, rootPath: string, templateElement: Element): Element[] => {
  if (!templateElement) {
    throw new Error('Failed to parse template');
  }
  const routeElement = findMatchingRouteElement(templateElement, routePath);
  const routeElementRenders = Array.from(routeElement?.querySelectorAll('px-render') || []);
  const nonRouteRenders = getNonRouteRenders(templateElement);
  const allRenderElements = [...routeElementRenders, ...nonRouteRenders];

  const templateElements = allRenderElements
    .map(element => {
      const templateAttr = element.getAttribute('template');
      if (!templateAttr) {
        throw new Error(`No template attribute defined by ${element.outerHTML} in ${rootPath}`);
      }
      const { id, templatePath } = getPathAndId(templateAttr);
      return {
        templatePath: path.resolve(path.dirname(rootPath), templatePath),
        id
      };
    }) 
    .map(({ templatePath, id }) => ({
      element: getTemplateElement(templateMap, templatePath, id),
      templatePath,
      id
    }))

  const childTemplateContents =
    templateElements
      .map(({ templatePath, element }) => getTemplates(routePath, templateMap, templatePath, element))
      .flat();

  return [...templateElements.map(({ element }) => element), ...childTemplateContents];
}

const getRouteTemplateElements = (templatesPath: string, templateMap: TemplateMap, routePath: string): Element[] => {
  const indexTemplatePath = path.join(templatesPath, 'index.html');
  const indexTemplate = templateMap.get(indexTemplatePath)?.get('main');
  if (!indexTemplate) {
    throw new Error(`No index template found at ${templatesPath}`);
  }
  return getTemplates(routePath, templateMap, indexTemplatePath, indexTemplate);
}

const buildTemplate = (templatesPath: string, templateMap: TemplateMap, routePath: string): string => {
  const elements = getRouteTemplateElements(templatesPath, templateMap, routePath);
  return elements.map(element => element.outerHTML).join('');
};

export default buildTemplate;