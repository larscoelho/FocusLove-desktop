// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // MUITO IMPORTANTE: base './' deixa CSS/JS/IMAGENS com caminho relativo,
  // funcionando no esquema file:// dentro do Electron
  base: './',
  build: {
    outDir: "dist/web",
    emptyOutDir: true
  }
});
