import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "@fontsource/inter-tight/400.css";
import "@fontsource/inter-tight/500.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./styles/global.css";
import "./styles/identity.css";
import "./styles/magazine.css";
import "./styles/daylight-theme.css";

// The portfolio lives at "/". Every other address (the career roadmap pages under /roadmap/,
// the owner's sign-in at /owner, and unknown links) loads the roadmap app, only when needed.
const RoadmapApp = lazy(() => import("./roadmap/RoadmapApp.jsx"));
const path = location.pathname.replace(/\/index\.html$/, "/");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {path === "/" ? <App /> : <Suspense fallback={null}><RoadmapApp path={path} /></Suspense>}
  </StrictMode>
);
