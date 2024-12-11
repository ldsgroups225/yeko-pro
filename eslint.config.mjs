import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  react: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "next/core-web-vitals",
  ],
  ignorePatterns: [
    ".eslintrc.cjs",
    "convex/_generated",
    // There are currently ESLint errors in shadcn/ui
    "components/ui",
  ],
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
})
