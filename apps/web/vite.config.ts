import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // read VITE_* variables from the monorepo root .env
  envDir: "../../",
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
