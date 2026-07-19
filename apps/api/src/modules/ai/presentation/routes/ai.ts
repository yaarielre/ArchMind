import { Router } from "express";

import { AIController } from "../controllers/AIController.js";

const router = Router();

const controller = new AIController();

router.post("/:projectId/enrich", controller.enrich);

export default router;
