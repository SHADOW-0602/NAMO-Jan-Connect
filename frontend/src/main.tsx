import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

declare global { var __NJC_API_URL__: string | undefined; }
globalThis.__NJC_API_URL__ = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "https://namo-jan-connect-api.kushagra-singh0602.workers.dev";

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
