import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { resolve } from "path";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    visualizer({
      template: "treemap",
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: "bundle-analysis.html",
    }),
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 10240, // 10kb
    }),
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 10240, // 10kb
    }),
  ],
  resolve: {
    alias: {
      // Keep existing Firebase aliases for tree-shaking
      "firebase/app": "firebase/app",
      "firebase/auth": "firebase/auth",
      "firebase/firestore": "firebase/firestore",
      "firebase/storage": "firebase/storage",
      // Add any other path aliases here
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false, // Disable source maps in production for smaller bundle
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: resolve(__dirname, "index.html"),
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react/jsx-runtime"],
          "ui-vendor": ["antd", "@ant-design/icons", "react-bootstrap"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          utils: ["date-fns", "papaparse"],
          icons: ["react-icons/fa", "react-icons/fa6", "react-icons/si"],
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          // Safely handle asset file naming with type checking
          if (!assetInfo.name) return "assets/[ext]/[name]-[hash][extname]";

          // Organize assets in subdirectories
          const nameParts = assetInfo.name.split(".");
          if (nameParts.length === 0)
            return "assets/[ext]/[name]-[hash][extname]";

          const ext = nameParts[nameParts.length - 1].toLowerCase();

          if (ext === "css") {
            return "assets/css/[name]-[hash][extname]";
          }
          if (["png", "jpg", "jpeg", "svg", "gif", "webp"].includes(ext)) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (["woff", "woff2", "eot", "ttf", "otf"].includes(ext)) {
            return "assets/fonts/[name]-[hash][extname]";
          }
          return "assets/[ext]/[name]-[hash][extname]";
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit to 1000kb
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true,
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "firebase/app",
      "firebase/auth",
      "firebase/firestore",
    ],
    exclude: [],
  },
});
