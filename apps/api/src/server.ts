import { app } from "./app.js";
import { parseEnv } from "./config/env.js";
import { logger } from "./lib/logger.js";

const env = parseEnv(process.env);

app.listen(env.port, () => {
  logger.info({ port: env.port }, "API server listening");
});
