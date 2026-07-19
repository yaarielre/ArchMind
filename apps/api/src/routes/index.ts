import { Router } from "express";

import healthRouter from "./health.routes.js";
import projectsRouter from "../modules/projects/presentation/routes/projects.js";
import analysisRouter from "../modules/analysis/presentation/routes/analysis.js";
import knowledgeRouter from "../modules/knowledge/presentation/routes/knowledge.js";
import documentationRouter from "../modules/documentation/presentation/routes/documentation.js";
import aiRouter from "../modules/ai/presentation/routes/ai.js";
import pdfRouter from "../modules/pdf/presentation/routes/pdf.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/projects", projectsRouter);
router.use("/analysis", analysisRouter);
router.use("/knowledge", knowledgeRouter);
router.use("/documentation", documentationRouter);
router.use("/ai", aiRouter);
router.use("/pdf", pdfRouter);

export default router;
