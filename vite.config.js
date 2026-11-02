import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" keeps asset paths relative, so the build works on GitHub Pages
// (ammakwarteng.github.io/amma-kwarteng-trace/) and when opened locally.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
