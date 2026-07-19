import { Router } from "express";

import { KnowledgeController } from "../controllers/KnowledgeController.js";

const router = Router();

const controller = new KnowledgeController();

router.get("/:projectId", controller.getByProject);
router.post("/:projectId/build", controller.buildForProject);

export default router;
