import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  
  const port = env.PORT ? Number(env.PORT) : 3000;
  const basePath = mode === "production" ? "/" : (env.BASE_PATH || "/");

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      mode !== "production" ? runtimeErrorOverlay() : undefined,
      ...(mode !== "production" &&
      env.REPL_ID !== undefined
        ? [
            (await import("@replit/vite-plugin-cartographer")).cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
            (await import("@replit/vite-plugin-dev-banner")).devBanner(),
          ]
        : []),
    ].filter(Boolean) as any[],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist"),
      emptyOutDir: true,
    },
    server: {
      port,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
