import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
    }),
  ],

  // Performance optimizations
  build: {
    // Target modern browsers for smaller bundles
    target: "es2015",

    // Minify with terser for better compression
    minify: "terser",

    // Terser options for aggressive minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info"], // Remove specific console methods
        passes: 2, // Multiple passes for better compression
      },
      mangle: {
        safari10: true, // Support Safari 10+
      },
      format: {
        comments: false, // Remove all comments
      },
    },

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,

    // Rollup options for advanced code splitting
    rollupOptions: {
      output: {
        // Manual chunks for better caching and loading
        manualChunks: (id) => {
          // Vendor chunks - external dependencies
          if (id.includes("node_modules")) {
            // React core
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "react-vendor";
            }

            // Firebase
            if (id.includes("firebase")) {
              return "firebase-vendor";
            }

            // UI libraries
            if (id.includes("lucide-react") || id.includes("react-hot-toast")) {
              return "ui-vendor";
            }

            // Other vendors
            return "vendor";
          }

          // Feature-based chunks
          // Admin pages
          if (id.includes("/pages/admin/")) {
            return "admin";
          }

          // Recommendation system - lazy load these heavy modules
          if (
            id.includes("/services/behavioralAnalytics") ||
            id.includes("/services/enhancedRecommendationEngine") ||
            id.includes("/services/collaborativeFiltering") ||
            id.includes("/services/recommendationAlgorithms") ||
            id.includes("/services/recommendationAnalytics") ||
            id.includes("/services/enhancedBehavioralTracking") ||
            id.includes("/services/trendEngine")
          ) {
            return "recommendations";
          }

          // CRM services
          if (
            id.includes("/services/crmAnalytics") ||
            id.includes("/services/userEngagementTracking")
          ) {
            return "crm";
          }

          // Components
          if (id.includes("/components/crm/")) {
            return "crm-components";
          }
        },

        // Naming pattern for chunks
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId;
          if (facadeModuleId) {
            // Admin chunks
            if (facadeModuleId.includes("/pages/admin/")) {
              return "assets/admin-[name]-[hash].js";
            }
            // Recommendation chunks
            if (
              facadeModuleId.includes("/services/") &&
              (facadeModuleId.includes("recommendation") ||
                facadeModuleId.includes("behavioral"))
            ) {
              return "assets/ml-[name]-[hash].js";
            }
          }
          return "assets/[name]-[hash].js";
        },

        // Entry file naming
        entryFileNames: "assets/[name]-[hash].js",

        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];

          // Organize by file type
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return "assets/images/[name]-[hash].[ext]";
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return "assets/fonts/[name]-[hash].[ext]";
          }
          if (/\.css$/i.test(assetInfo.name)) {
            return "assets/css/[name]-[hash].[ext]";
          }
          return "assets/[name]-[hash].[ext]";
        },
      },

      // Tree shaking optimizations
      treeshake: {
        moduleSideEffects: "no-external",
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },

    // Source map configuration (disabled in production for smaller builds)
    sourcemap: false,

    // Report compressed size (can be slow, disable if needed)
    reportCompressedSize: true,

    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },

  // Development server configuration
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    open: false,

    // CORS configuration
    cors: true,

    // HMR configuration
    hmr: {
      overlay: true,
      timeout: 5000,
    },
  },

  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
    strictPort: false,
    open: false,
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "firebase/app",
      "firebase/auth",
      "firebase/firestore",
      "firebase/storage",
    ],
    exclude: [
      // Exclude large recommendation modules from pre-bundling
      // They will be code-split instead
    ],
    esbuildOptions: {
      // Optimization for dependencies
      target: "es2015",
      supported: {
        "top-level-await": true,
      },
    },
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0"),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  // Resolve configuration
  resolve: {
    alias: {
      // Add path aliases if needed
      // '@': path.resolve(__dirname, './src')
    },
    extensions: [".mjs", ".js", ".jsx", ".json"],
  },

  // CSS configuration
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: "camelCase",
    },
    postcss: "./postcss.config.js",
  },

  // ESBuild configuration for faster builds
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
    legalComments: "none",
    treeShaking: true,
  },

  // JSON configuration
  json: {
    stringify: true,
  },
});
