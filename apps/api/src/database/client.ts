import mongoose from "mongoose";

import { env } from "../config/env.js";
import { logger } from "../shared/logger/logger.js";

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.MONGO_URI);
  logger.info("MongoDB connected");
}
