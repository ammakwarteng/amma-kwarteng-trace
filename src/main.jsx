import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "@fontsource-variable/bodoni-moda/opsz.css";          // hero title and magazine headings
import "@fontsource-variable/bodoni-moda/opsz-italic.css";   // magazine section titles and captions
import "@fontsource/inter-tight/400.css";
import "@fontsource/inter-tight/500.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./styles/global.css";
import "./styles/identity.css";
import "./styles/magazine.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
