module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    'no-console': 'warn',
  },
  overrides: [
    {
      files: ['src/shared/logger/logger.service.ts'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
  ignorePatterns: ['.eslintrc.js', 'dist/', 'node_modules/'],
};
