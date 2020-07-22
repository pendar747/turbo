#!/usr/bin/env node
import express from 'express';

const server = express();

// const middleware = createMiddleware('/templates', '/state');
// server.use(middleware);

server.listen(5000, () => {
  console.log('Listening on port 5000');
});