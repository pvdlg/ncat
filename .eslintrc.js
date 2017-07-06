module.exports = {
  extends: [
    '@metahub/eslint-config/node-config',
    '@metahub/eslint-config/es6-config',
    '@metahub/eslint-config/promise-config',
  ],
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
  },
};
