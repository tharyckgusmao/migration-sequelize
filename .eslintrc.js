module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "airbnb-base",
    "prettier",
    "plugin:security/recommended"
    
  ],
  plugins: ["prettier","security"],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    "prettier/prettier": "error",

  },
};