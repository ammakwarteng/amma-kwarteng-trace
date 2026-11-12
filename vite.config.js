import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { copyFileSync } from "node:fs";

// base "/": the site is served from the root of ammakwarteng.com, and pages like
// /roadmap/iam-analyst need absolute asset paths. GitHub Pages serves 404.html for any address
// that isn't a file, so a copy of index.html there lets those pages load the app.
// the footer's "last updated" month: set when the site is built, so every deploy refreshes it
const UPDATED = new Date().toLocaleDateString("en-CA", { month: "long", year: "numeric", timeZone: "America/Toronto" });

export default defineConfig({
  plugins: [react(), { name: "spa-404", closeBundle() { copyFileSync("dist/index.html", "dist/404.html"); } }],
  base: "/",
  define: { __UPDATED__: JSON.stringify(UPDATED) },
});
