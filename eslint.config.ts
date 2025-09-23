import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { configs, parser } from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

// @ts-expect-error eslint-plugin-promise has no types
import pluginPromise from 'eslint-plugin-promise'

import solid from "eslint-plugin-solid/configs/typescript";

import { includeIgnoreFile } from '@eslint/compat';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

export default defineConfig(
  includeIgnoreFile(gitignorePath),
  {
    ignores: [
      '**/*.d.ts',
      '*.{js,jsx}',
      '**/*.css',
      'node_modules/**/*',
      'dist',
      'vite.config.ts',
    ],
  },
  eslint.configs.recommended,
  pluginPromise.configs['flat/recommended'],
  ...configs.strict,
  ...configs.stylistic,
  {
    files: ['src/**/*.tsx', 'src/**/*.ts', 'vite-env.d.ts', 'vite.config.ts'],
    ...solid,
    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig-eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@stylistic': stylistic,
    },
    settings: {
      'import/parsers': {
        espree: ['.js', '.cjs', '.mjs'],
        'typescript-eslint/parser': ['.ts'],
      },
      'import/internal-regex': '^~/',
      'import/resolver': {
        node: true,
        typescript: true,
      },
    },
    rules: {
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/quotes': ['error', 'single'],
      'import/no-unresolved': ['error', { ignore: ['^~solid-pages$'] }],
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error'
    }
  },
);
