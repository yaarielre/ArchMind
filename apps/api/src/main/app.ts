import express from "express";
import cors from "cors";
import type { Application } from "express";
import { env } from "../config/env.js";
import { errorHandler } from "../shared/errorHandler.js";
import { AppError } from "../shared/AppError.js";
import routes from "../routes/index.js";

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.CORS_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new AppError("Origin not allowed by CORS", 403, "CORS_ORIGIN_DENIED"));
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Routes
app.use(routes);

app.use(errorHandler);

export default app;
