import path from 'path';
import express from 'express';
import readTemplates from './readTemplates';

const createMiddleware = (templatesPath: string, statePath: string) => {
  const templateTree = readTemplates(templatesPath);

  const middleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    next();
  };

  return middleware;
}

export default createMiddleware;