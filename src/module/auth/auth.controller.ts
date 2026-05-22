import express, { Request, Response } from "express";
import * as AuthService from "./auth.service";
import sendResponse from "../../utills/sendResponse";

export const signupUser = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.signup(req.body);
    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.login(req.body);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};
