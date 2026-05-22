import express from "express";

import {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
} from "./issue.controller";

import { auth } from "../../middleware/auth";
import { checkRole } from "../../middleware/checkRole";

const router = express.Router();

router.post("/", auth, createIssue);

router.get("/", getAllIssues);

router.get("/:id", getSingleIssue);

router.patch("/:id", auth, updateIssue);

router.delete("/:id", auth, checkRole("maintainer"), deleteIssue);

export default router;
