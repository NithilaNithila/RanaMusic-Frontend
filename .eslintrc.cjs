/** @type {import('eslint').Linter.Config} */
const config = {
  env: {
    browser: true,
    es2022: true,
    jest: true,
  },
  extends: [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "eslint:recommended",
    "prettier",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: [
    "react",
    "react-hooks",
    "testing-library",
  ],
  rules: {
    "react/react-internal": "off",
    "react-hooks/exhaustive-deps": "warn",
    "no-unused-vars": ["error", { "varsIgnorePattern": "^_" }],
    "computed-property-spacing": ["error", "never"],
    "eqeqeq": "error",
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "no-undef": "error",
  },
};

module.exports = config;