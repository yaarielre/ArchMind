import { Router } from "express";

import { ProjectController } from "../controllers/ProjectController.js";
import { uploadZip } from "../../../../shared/middleware/upload.js";

const router = Router();

const controller = new ProjectController();

router.get("/gettingAllData", controller.getAll);
router.get("/:projectId", controller.getById);
router.post("/file/name", controller.create);
router.post("/upload/project/zip", uploadZip.single("file"), controller.upload);

export default router;
