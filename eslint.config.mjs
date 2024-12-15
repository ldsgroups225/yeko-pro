import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  react: true,
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
