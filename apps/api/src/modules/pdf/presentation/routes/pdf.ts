import { Router } from "express";

import { PDFController } from "../controllers/PDFController.js";

const router = Router();

const controller = new PDFController();

router.post("/:projectId", controller.generate);
router.post("/from-markdown/raw", controller.generateFromMarkdown);

export default router;
