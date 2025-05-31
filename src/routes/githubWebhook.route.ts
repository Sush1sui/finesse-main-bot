import { Router } from "express";
import { sendNotification } from "../controllers/githubWebhook.controller";

const githubWebhookRoutes = Router();

githubWebhookRoutes.post("/", sendNotification);

export default githubWebhookRoutes;
