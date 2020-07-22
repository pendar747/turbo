#!/usr/bin/env node
import express from 'express';
import path from 'path';
import createMiddleware from './createMiddleware';
import { DEFAULT_TEMPLATE_PATH, DEFAULT_STATE_PATH } from './constants';

const startServer = async () => {
  const server = express();

  const templatePath = path.resolve(DEFAULT_TEMPLATE_PATH);
  const statePath = path.join(DEFAULT_STATE_PATH);

  const middleware = await createMiddleware(templatePath, statePath);
  server.use(middleware);

  server.listen(5000, () => {
    console.log('Listening on port 5000');
  });
}

startServer();
