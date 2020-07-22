#!/usr/bin/env node
import express from 'express';
import path from 'path';
import createMiddleware from './createMiddleware';

const server = express();

const DEFAULT_TEMPLATE_PATH = './src/templates';
const DEFAULT_STATE_PATH = './src/state';

const templatePath = path.resolve(DEFAULT_TEMPLATE_PATH);
const statePath = path.join(DEFAULT_STATE_PATH);

console.log('templatePath', templatePath);

const middleware = createMiddleware(templatePath, statePath);
server.use(middleware);

server.listen(5000, () => {
  console.log('Listening on port 5000');
});