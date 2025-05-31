import "dotenv/config";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
const uri = process.env.DB_CONNECTION_STRING;
if (!uri) throw new Error("No connection string");
mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((e) => console.log(e));

import "./bot";
// import githubWebhookRoutes from "./routes/githubWebhook.route";
import { pingBot } from "./utils/helpers";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

// unused routes can be uncommented if needed
// app.use("/github-webhook", githubWebhookRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.send("Bot is running");
});

setInterval(pingBot, 600000); // Ping every 10 minutes

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on("SIGINT", () => {
  console.log("Server shutting down gracefully");
  process.exit(0);
});
