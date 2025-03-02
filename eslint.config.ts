import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    languageOptions: {
      parser: tseslint.parser,
      sourceType: "module",
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      eqeqeq: ["error", "always"],
      curly: ["error", "multi-line"],
      "arrow-body-style": ["error", "as-needed"],
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
  },
  js.configs.recommended,
  tseslint.configs.recommended
);
