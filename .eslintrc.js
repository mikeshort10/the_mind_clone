module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    // "plugin:prettier/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:functional/recommended",
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 11,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "functional"],
  rules: {
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error"],
    "functional/functional-parameters": 0,
    "functional/no-expression-statement": [
      "error",
      {
        ignorePattern: ["socket.", "console.error", "console.info"],
      },
    ],
    "functional/no-return-void": 0,
  },
  overrides: [
    {
      files: ["**/__tests__/*"],
      rules: {
        "functional/no-expression-statement": [
          2,
          {
            ignorePattern: ["^describe", "^it", "^expect"],
          },
        ],
      },
    },
  ],
};
