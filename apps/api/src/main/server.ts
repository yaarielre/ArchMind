import app from "./app.js";
import { connectDatabase } from "../database/index.js";
import { env } from "../config/env.js";
import { logger } from "../shared/logger/logger.js";

async function main(): Promise<void> {
  await connectDatabase();

  app.listen(env.PORT, () => {
    logger.info(`ArchMind API http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
