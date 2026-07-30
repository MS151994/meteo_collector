// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, {
  ignores: ['node_modules', 'build', '*.js'],
  plugins: {
    'unused-imports': unusedImports,
  },
  rules: {
    'no-console': 'warn',
    '@typescript-eslint/no-empty-interface': 0,
    'no-case-declarations': 'off',
    '@typescript-eslint/ban-types': 0,
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-inferrable-types': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/explicit-member-accessibility': 'error',
    'keyword-spacing': 'error',
    'object-curly-spacing': ['error', 'never'],
    'comma-spacing': ['error', {before: false, after: true}],
    'no-trailing-spaces': 'error',
    'key-spacing': ['error', {afterColon: true}],
    semi: ['error', 'always'],
    'no-unused-expressions': 'error',
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'no-duplicate-imports': 'error',
    curly: 'error',
    'default-case': 'error',
    'default-case-last': 'error',
    eqeqeq: 'warn',
    'no-array-constructor': 'error',
    'no-else-return': 'error',
    'no-labels': 'error',
    'no-lonely-if': 'error',
    'no-nested-ternary': 'warn',
    'no-return-await': 'error',
    'arrow-parens': 'warn',
    'arrow-spacing': 'error',
    'block-spacing': 'error',
    indent: 'off',
    'linebreak-style': ['error', 'unix'],
    'space-in-parens': 'error',
    'no-mixed-spaces-and-tabs': ['warn', 'smart-tabs'],
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
});
