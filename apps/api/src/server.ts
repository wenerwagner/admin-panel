import { app } from "./app.js";

const DEFAULT_PORT = 3000;
const parsedPort = Number.parseInt(process.env.PORT ?? "", 10);
const port = Number.isNaN(parsedPort) ? DEFAULT_PORT : parsedPort;

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
