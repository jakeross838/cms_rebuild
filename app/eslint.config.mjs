import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * ESLint Configuration
 *
 * Enforces code quality standards as defined in docs/standards/CODE_STANDARDS.md
 *
 * Run: npm run lint
 * Fix: npm run lint:fix
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Global ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    "*.config.js",
    "*.config.mjs",
  ]),

  // Custom rules
  {
    rules: {
      // TypeScript strict rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],
      "@typescript-eslint/consistent-type-imports": ["error", {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      }],

      // Prefer const
      "prefer-const": "error",

      // No console in production code (warn to allow during development)
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Enforce consistent returns
      "consistent-return": "error",

      // No duplicate imports
      "no-duplicate-imports": "error",

      // React rules
      "react/jsx-no-leaked-render": ["error", { validStrategies: ["ternary", "coerce"] }],
      "react/self-closing-comp": "error",
      "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],

      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Import organization (works with Prettier)
      "import/order": ["error", {
        groups: [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling"],
          "index",
          "type",
        ],
        pathGroups: [
          { pattern: "react", group: "builtin", position: "before" },
          { pattern: "next/**", group: "builtin", position: "before" },
          { pattern: "@/**", group: "internal", position: "before" },
        ],
        pathGroupsExcludedImportTypes: ["react", "next"],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      }],
      "import/no-duplicates": "error",
      "import/no-cycle": "error",

      // Accessibility
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
    },
  },

  // Relaxed rules for test files
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/tests/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },
]);

export default eslintConfig;
