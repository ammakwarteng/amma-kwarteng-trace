import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" keeps asset paths relative, so the build works on GitHub Pages
// (ammakwarteng.github.io/amma-kwarteng-trace/) and when opened locally.
// the footer's "last updated" month: set when the site is built, so every deploy refreshes it
const UPDATED = new Date().toLocaleDateString("en-CA", { month: "long", year: "numeric", timeZone: "America/Toronto" });

export default defineConfig({
  plugins: [react()],
  base: "./",
  define: { __UPDATED__: JSON.stringify(UPDATED) },
});
