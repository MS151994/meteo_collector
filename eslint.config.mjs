// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import myConfig from '@scope/eslint-config-myconfig';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...myConfig,
    ignores: ['node_modules', 'build', '*.js'],
  },
);
