import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "off",
      // Prevent console statements - use logger instead
      "no-console": "error",
    },
  },
  {
    // Allow console in specific files where logger is implemented
    files: [
      "lib/utils/logger.ts",
      "lib/utils/performance-monitor.tsx",
      "components/providers/performance-provider.tsx",
    ],
    rules: {
      "no-console": "off",
    },
  },
  // Override default ignores of eslint-config-next
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
  ]),
]);

export default eslintConfig;
