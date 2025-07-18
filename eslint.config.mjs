import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  rules: {
    'node/prefer-global/process': 'off',
    'react-hooks/exhaustive-deps': 'off',
  },
  ignores: [
    'node_modules',
    '.next',
    'dist',
    'build',
    'public',
    'next-env.d.ts',
    'next.config.mjs',
    'tsconfig.json',
    'tsconfig.node.json',
    'components/ui/**',
  ],
})
