import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes";
import issueRoutes from "./modules/issues/issue.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("DevPulse Server Running");
});

export default app;
