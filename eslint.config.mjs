import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  react: true,
  extends: ['next/core-web-vitals'],
  rules: {
    'node/prefer-global/process': 'off',
    'react-hooks/exhaustive-deps': 'off',
  },
  ignores: [
    '.next/',
    '.vscode/',
    'components/ui/',
    'node_modules/',
    'public/',
    'tailwind.config.js',
    '.gitignore',
    'convex/_generated/',
    'convex.config.ts',
  ],
})
