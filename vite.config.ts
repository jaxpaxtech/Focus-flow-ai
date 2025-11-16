import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",          // try "./". If still fails, try base: "/"
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
