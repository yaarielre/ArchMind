import multer from "multer";
import { AppError } from "../AppError.js";

const storage = multer.memoryStorage();

export const uploadZip = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, cb) {
    if (
      file.mimetype !== "application/zip" &&
      file.originalname.toLowerCase().endsWith(".zip") === false
    ) {
      return cb(
        new AppError("Only .zip files are allowed", 400, "INVALID_FILE_TYPE"),
      );
    }
    cb(null, true);
  },
});
