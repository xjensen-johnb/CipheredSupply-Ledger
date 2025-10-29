import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['wagmi', 'viem', '@rainbow-me/rainbowkit'],
    esbuildOptions: {
      logLevel: 'error',
      logOverride: { 'ignored-source-map': 'silent' },
    },
  },
}));
