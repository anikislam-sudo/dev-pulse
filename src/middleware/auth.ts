import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import sendResponse from "../utills/sendResponse";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    req.user = decoded;

    next();
  } catch (error) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Invalid token",
    });
  }
};
