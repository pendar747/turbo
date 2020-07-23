import { TemplateMap } from "./types";
import path from 'path';
import Template from "./Template";

const getTemplate = (templateMap: TemplateMap, templatePath: string, id: string): Template => {
  const pathMap = templateMap.get(templatePath);
  if (!pathMap) {
    throw new Error(`No template at ${templatePath}`);
  }
  const element = pathMap.getTemplate(id);
  if (!element) {
    throw new Error(`No elements with id ${id} defined in ${templatePath}`)
  }
  return element;
}

const getTemplates = (routePath: string, templateMap: TemplateMap, rootPath: string, template: Template): Template[] => {
  if (!template) {
    throw new Error('Failed to parse template');
  }
  const allRenderElements = template.getAllRenderElementsMatchingPath(routePath);

  const templateElements = allRenderElements
    .map((render) => getTemplate(templateMap, render.getTemplatePathRelativeTo(rootPath), render.templateId))

  const childTemplateContents =
    templateElements
      .map(template => getTemplates(routePath, templateMap, template.filePath, template))
      .flat();

  return [...templateElements, ...childTemplateContents];
}

const getRouteTemplateElements = (templatesPath: string, templateMap: TemplateMap, routePath: string): Template[] => {
  const indexTemplatePath = path.join(templatesPath, 'index.html');
  const indexTemplate = templateMap.get(indexTemplatePath)?.getTemplate('main');
  if (!indexTemplate) {
    throw new Error(`No index template found at ${templatesPath}`);
  }
  return getTemplates(routePath, templateMap, indexTemplatePath, indexTemplate);
}

const buildTemplate = (templatesPath: string, templateMap: TemplateMap, routePath: string): string => {
  const templates = getRouteTemplateElements(templatesPath, templateMap, routePath);
  return templates.map(template => template.toString()).join('');
};

export default buildTemplate;