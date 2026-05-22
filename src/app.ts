import express, { type Request, type Response } from "express";

import cors from "cors";

import authRoutes from "./module/auth/auth.routes";
import issueRoutes from "./module/issues/issue.routes";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.get("/", (req: Request, res: Response) => {
  res.send("DevPulse Server Running");
});

export default app;
