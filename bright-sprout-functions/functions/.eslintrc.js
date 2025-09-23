module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended", // keep basic TS rules
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*",        // Ignore built files
    "/generated/**/*",  // Ignore generated files
  ],
  plugins: [
    "@typescript-eslint",
  ],
  rules: {
    // Style rules (relaxed)
    quotes: ["warn", "double"],   // warn instead of error
    indent: ["warn", 2],          // warn instead of error
    
    // TypeScript rules (relaxed)
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": ["warn"],

    // Import rules (disabled for flexibility)
    "import/no-unresolved": "off",
    "import/order": "off",
  },
};
