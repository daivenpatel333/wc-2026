import { defineConfig, lazyPlugins } from "vite-plus";

const config = defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  test: {
    passWithNoTests: true,
  },
  fmt: {
    ignorePatterns: ["src/routeTree.gen.ts"],
  },
  lint: {
    ignorePatterns: ["src/routeTree.gen.ts"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  resolve: { tsconfigPaths: true },
  plugins: lazyPlugins(async () => {
    const [
      { devtools },
      { tanstackStart },
      { default: viteReact },
      { default: tailwindcss },
      { nitro },
    ] = await Promise.all([
      import("@tanstack/devtools-vite"),
      import("@tanstack/react-start/plugin/vite"),
      import("@vitejs/plugin-react"),
      import("@tailwindcss/vite"),
      import("nitro/vite"),
    ]);

    const isTestCommand =
      process.env.VITEST === "true" ||
      process.env.NODE_ENV === "test" ||
      process.argv.some((arg) => arg === "test" || arg.includes("vite-plus-test"));

    return [
      devtools(),
      ...(isTestCommand ? [] : [nitro({ config: { rollupConfig: { external: [/^@sentry\//] } } })]),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ];
  }),
});

export default config;
