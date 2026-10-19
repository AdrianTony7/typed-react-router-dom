import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    sourcemap: true,
    minify: false,
    deps: { neverBundle: ["react", "react-dom", "react-router-dom"] },
  },
  test: {
    environment: "happy-dom",
    include: ["tests/**/*.test.{ts,tsx}"],
    globals: true,
  },
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
      "@typescript-eslint/no-floating-promises": "off",
      "unicorn/no-empty-file": "off",
    },
    options: { typeAware: true, typeCheck: true },
  },
});
