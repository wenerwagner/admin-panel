import { app } from "./app.js";
import { parseEnv } from "./config/env.js";

const env = parseEnv(process.env);

app.listen(env.port, () => {
  console.log(`API server listening on port ${env.port}`);
});
