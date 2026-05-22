import express, { Request, Response } from "express";
import * as IssueService from "./issue.service";
import sendResponse from "../../utills/sendResponse";

// CREATE
export const createIssue = async (req: Request, res: Response) => {
  try {
    const result = await IssueService.createIssueIntoDB(req.body, req.user.id);

    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
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

// GET ALL
export const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await IssueService.getAllIssuesFromDB(req.query);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result,
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE
export const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const result = await IssueService.getSingleIssueFromDB(
      Number(req.params.id),
    );

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result,
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
export const updateIssue = async (req: Request, res: Response) => {
  try {
    const result = await IssueService.updateIssueIntoDB(
      Number(req.params.id),
      req.body,
      req.user,
    );

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
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

// DELETE
export const deleteIssue = async (req: Request, res: Response) => {
  try {
    await IssueService.deleteIssueFromDB(Number(req.params.id));

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: error.message,
    });
  }
};
