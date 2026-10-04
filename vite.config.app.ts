import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: path.resolve(import.meta.dirname, "./src/client"), 
  build: {
    emptyOutDir: true,  
    outDir: path.resolve(import.meta.dirname, "./dist"), 
    sourcemap: true
  }
})
