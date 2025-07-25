import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@workspace/backend-common/config";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"] ?? "";

  if (!token) {
    res.status(403).json({});
    return;
  }

  const decoded = jwt.verify(token, JWT_SECRET);
  try {
    // @ts-ignore
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(403).json({});
    return;
  }
};

export default authMiddleware;
