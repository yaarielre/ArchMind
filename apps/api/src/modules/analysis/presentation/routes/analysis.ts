import { Router } from "express";

import { AnalysisController } from "../controllers/AnalysisController.js";

const router = Router();

const controller = new AnalysisController();

router.get("/:projectId", controller.getByProject);
router.post("/:projectId/reanalyze", controller.reanalyze);

export default router;
