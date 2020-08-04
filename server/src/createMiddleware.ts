import express from 'express';
import readTemplates from './readTemplates';
import buildTemplate from './buildTemplate';

const createMiddleware = async (templatesPath: string, statePath: string) => {
  const templateMap = await readTemplates(templatesPath);

  const middleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const response = buildTemplate(templatesPath, templateMap, req.path);
    res.contentType('html').send(response);
  };

  return middleware;
}

export default createMiddleware;