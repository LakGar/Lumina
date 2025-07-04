import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: pluginReact,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
    },
  },
  {
    files: ["**/*.json"],
    plugins: { json },
    languageOptions: { parser: json.parser },
    rules: { ...json.configs.recommended.rules },
  },
  {
    files: ["**/*.md"],
    plugins: { markdown },
    languageOptions: { parser: markdown.parser },
    rules: { ...markdown.configs.recommended.rules },
  },
]);
