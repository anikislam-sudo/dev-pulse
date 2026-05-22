import { NextFunction, Request, Response } from "express";
import sendResponse from "../utills/sendResponse";

export const checkRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden",
      });
    }

    next();
  };
};
