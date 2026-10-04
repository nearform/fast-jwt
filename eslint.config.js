const js = require('@eslint/js')
const prettierRecommended = require('eslint-plugin-prettier/recommended')
const globals = require('globals')
const tseslint = require('typescript-eslint')

module.exports = tseslint.config(
  {
    ignores: [
      'website/node_modules/**',
      'website/build/**',
      'website/.docusaurus/**',
      'website/docs/api/**',
      'website/docs/index.md'
    ]
  },
  js.configs.recommended,
  prettierRecommended,
  {
    files: ['*.ts'],
    extends: [tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  {
    languageOptions: {
      globals: {
        ...globals.node
      },
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  }
)
