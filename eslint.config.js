// eslint.config.js
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

/** @type {import("eslint").FlatConfig[]} */
export default [
  // 1) ビルド成果物と node_modules は無視
  { ignores: ['dist/**', 'node_modules/**'] },

  // 2) ソース全体にルールを適用
  {
    files: ['**/*.{js,jsx,ts,tsx}'],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: globals.browser,
    },

    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
      '@typescript-eslint': tsPlugin,
      'unused-imports': unusedImportsPlugin,
    },

    rules: {
      // React Hooks 推奨設定
      ...reactHooksPlugin.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Irregular whitespace をオフ
      'no-irregular-whitespace': 'off',

      // ★ 未使用インポートを自動削除
      'unused-imports/no-unused-imports': 'error',

      // ★ 未使用変数は警告（args を無視）
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', args: 'none', ignoreRestSiblings: true }
      ],

      // TypeScript 側の any チェックをオフ
      '@typescript-eslint/no-explicit-any': 'off',
    },

    settings: {
      react: { version: 'detect' },
    },
  },
];
