import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Router } from "./routes/router.js";
import "./styles/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <Router />
  </StrictMode>,
);
