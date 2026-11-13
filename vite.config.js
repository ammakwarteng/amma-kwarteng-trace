import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { copyFileSync, mkdirSync } from "node:fs";

const ROADMAP_PAGES = ["help-desk", "iam-analyst", "iam-engineer", "iam-architect"];

// base "/": the site is served from the root of ammakwarteng.com, and pages like
// /roadmap/iam-analyst need absolute asset paths. GitHub Pages serves 404.html for any address
// that isn't a file, so a copy of index.html there lets those pages load the app.
// the footer's "last updated" month: set when the site is built, so every deploy refreshes it
const UPDATED = new Date().toLocaleDateString("en-CA", { month: "long", year: "numeric", timeZone: "America/Toronto" });

export default defineConfig({
  plugins: [react(), {
    // each roadmap page and /owner also gets its own real file, so they load with a normal
    // "200 OK" (search engines and link previews treat 404.html pages as missing)
    name: "spa-pages",
    closeBundle() {
      copyFileSync("dist/index.html", "dist/404.html");
      for (const page of [...ROADMAP_PAGES.map((s) => `roadmap/${s}`), "owner", "school"]) {
        mkdirSync(`dist/${page}`, { recursive: true });
        copyFileSync("dist/index.html", `dist/${page}/index.html`);
      }
    },
  }],
  base: "/",
  define: { __UPDATED__: JSON.stringify(UPDATED) },
});
