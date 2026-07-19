import { Router } from "express";

import { DocumentationController } from "../controllers/DocumentationController.js";

const router = Router();

const controller = new DocumentationController();

router.get("/sections", controller.getSections);
router.get("/:projectId", controller.get);
router.post("/:projectId/generate", controller.generate);

export default router;
