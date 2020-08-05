import { NextFunction, Request, Response } from "express";
import { Assets } from "./types";
import { NOT_FOUND } from 'http-status-codes';
import path from 'path';

const middleware = (assets: Assets) => (req: Request, res: Response, next: NextFunction) => {
  const content = assets.find(({ filename }) => filename === path.basename(req.path));
  if (content) {
    res.send(content);
  } else {
    res.status(NOT_FOUND);
  }
}

export default middleware;