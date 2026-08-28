import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" keeps asset paths relative so the build can be served from any
// subpath (e.g. GitHub Pages at /sycophantic-drift/).
// server.fs.allow lets the dev server read ../data, which holds the dataset.
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    fs: { allow: [".."] },
  },
});
