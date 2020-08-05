import express from 'express';
import readTemplates from './readTemplates';
import buildTemplate from './buildTemplate';
import { Assets } from './webpack/types';

const createMiddleware = async (templatesPath: string, assets: Assets) => {
  const templateMap = await readTemplates(templatesPath);

  const middleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const response = buildTemplate(templateMap, req.path, assets);
    res.contentType('html').send(response);
  };

  return middleware;
}

export default createMiddleware;