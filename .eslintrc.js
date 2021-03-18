module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      classes: true,
      jsx: true,
    },
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  plugins: ['react', 'prettier'],
  extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
  rules: {
    // 'prettier/prettier': 'error',
    // 'no-console': 'error',
    // 'no-debugger': 'error',
    // 'react/prop-types': 0,

    'prefer-arrow-callback': 2,
    'prefer-const': 2,
    'prefer-promise-reject-errors': 2,
    'prettier/prettier': 2,
    strict: [2, 'global'],
    'no-console': 2,
    'react/prop-types': 0,
  },
  settings: {
    react: {
      version: '17.0.1',
    },
  },
};
