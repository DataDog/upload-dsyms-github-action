import github from 'eslint-plugin-github';
import jestPlugin from 'eslint-plugin-jest';
import * as tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  // Base configurations
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,

  // GitHub plugin configurations
  github.getFlatConfigs().recommended,
  
  // TypeScript-specific linting configuration
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        ...globals.node,
        ...globals.es2015
      }
    },
    plugins: {
      jest: jestPlugin,
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      "i18n-text/no-en": "off",
      "eslint-comments/no-use": "off",
      "camelcase": "off",
      "sort-imports": "off",
      "semi": ["error", "never"],
      "import/no-namespace": "off",
      "no-unused-vars": "off",
      "filenames/match-regex": "off",
      "import/no-unresolved": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/explicit-member-accessibility": ["error", {"accessibility": "no-public"}],
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/array-type": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/consistent-type-assertions": "error",
      "@typescript-eslint/explicit-function-return-type": ["error", {"allowExpressions": true}],
      "@typescript-eslint/no-array-constructor": "error",
      "@typescript-eslint/no-empty-interface": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-extraneous-class": "error",
      "@typescript-eslint/no-for-in-array": "error",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/no-misused-new": "error",
      "@typescript-eslint/no-namespace": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-useless-constructor": "error",
      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/prefer-for-of": "warn",
      "@typescript-eslint/prefer-function-type": "warn",
      "@typescript-eslint/prefer-includes": "error",
      "@typescript-eslint/prefer-string-starts-ends-with": "error",
      "@typescript-eslint/promise-function-async": "error",
      "@typescript-eslint/require-array-sort-compare": "error",
      "@typescript-eslint/restrict-plus-operands": "error"
    }
  },
  
  // Test files configuration
  {
    files: ['**/*.test.ts'],
    languageOptions: {
      globals: jestPlugin.environments.globals.globals
    }
  }
];
