import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n.ts";
import "./index.css";
import App from "./App.tsx";
import { prepareOfflineCache } from "./offlineBoot.ts";

function mountApp() {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void prepareOfflineCache().then(mountApp, mountApp);
