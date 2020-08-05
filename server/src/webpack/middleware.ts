import { NextFunction, Request, Response } from "express";
import { Assets } from "./types";
import { NOT_FOUND } from 'http-status-codes';
import path from 'path';

const middleware = (assets: Assets) => (req: Request, res: Response, next: NextFunction) => {
  const asset = assets.find(({ filename }) => filename === path.basename(req.path));
  if (asset) {
    res.contentType('application/json').send(asset.content);
  } else {
    res.sendStatus(NOT_FOUND);
  }
}

export default middleware;