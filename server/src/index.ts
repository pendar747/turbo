import path from 'path';
import fs from 'fs';
import express from 'express';

// const readTemplates = async (templatesPath: string) => {
//   const dir = await fs.promises.opendir(templatesPath);
//   for await (const dirent of dir) {
//     if (dirent.isDirectory()) {
//       console.log('foo');
//     }
//   }
// }

// export const createMiddleware = (templatesPath: string, statePath: string) => {
//   const templateTree = readTemplates(templatesPath);
//   const State = buildState(statePath);

//   const middleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
//     if (req.path.indexOf('/template') === 0) {
//       return serveTemplates(req, res, next);
//     }
//     const parameters = getParameters(req);
//     const state = runState(State, parameters);
//     if (routeExists(templateTree)) {
//       const htmlResponse = buildHtmlResponse(templateTree, state, parameters);
//       res.send(htmlResponse);
//     } else {
//       next();
//     }
//   };

//   return middleware;
// }


const server = express();

// const middleware = createMiddleware('/templates', '/state');
// server.use(middleware);

server.listen(5000, () => {
  console.log('Listening on port 5000');
});
