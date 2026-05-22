import type { Request, Response } from "express";
import * as IssueService from "./issue.service";

export const createIssue = async (req: Request, res: Response) => {
  try {
    const result = await IssueService.createIssueIntoDB(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllIssues = async (req: Request, res: Response) => {
  const result = await IssueService.getAllIssuesFromDB(req.query);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const result = await IssueService.getSingleIssueFromDB(
      Number(req.params.id),
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateIssue = async (req: Request, res: Response) => {
  try {
    const result = await IssueService.updateIssueIntoDB(
      Number(req.params.id),
      req.body,
      req.user,
    );

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteIssue = async (req: Request, res: Response) => {
  try {
    await IssueService.deleteIssueFromDB(Number(req.params.id));

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};
