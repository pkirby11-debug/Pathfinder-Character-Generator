import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// When deployed to GitHub Pages at https://<user>.github.io/Pathfinder-Character-Generator/,
// the base path is the repo name. For local dev it's just "/".
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? "/Pathfinder-Character-Generator/" : "/",
});
