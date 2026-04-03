import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [preact()],
  build: {
    lib: {
      entry:    resolve(__dirname, "src/index.jsx"),
      name:     "CountdownTimerWidget",
      formats:  ["iife"],
      fileName: () => "widget.js",
    },
    // Output directly into extension assets folder
    outDir:    resolve(__dirname, "../extensions/countdown-timer-extension/assets"),
    emptyOutDir: false,
  },
});