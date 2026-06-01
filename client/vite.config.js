import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import fs from "fs";

// Plugin to copy index.html as 404.html after build (SPA fallback for static hosts)
const copy404Plugin = {
  name: "copy-404",
  closeBundle() {
    const dist = resolve("dist");
    const index = resolve(dist, "index.html");
    const notFound = resolve(dist, "404.html");
    if (fs.existsSync(index)) {
      fs.copyFileSync(index, notFound);
    }
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), copy404Plugin],
});
