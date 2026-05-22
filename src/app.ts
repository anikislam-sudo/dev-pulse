import express, { type Request, type Response } from "express";

import cors from "cors";

import authRoutes from "./module/auth/auth.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("DevPulse Server Running");
});

export default app;
