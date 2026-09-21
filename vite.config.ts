import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.PORT || env.VITE_PORT) || 5173;
  const host = env.HOST || env.VITE_HOST || "0.0.0.0";
  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    server: {
      host: host,
      port: port,
      allowedHosts: true,
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL || "http://amal-dev.rutherweb.my.id",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          secure: true,
          timeout: 30000,
        },
      },
    },
  };
});
