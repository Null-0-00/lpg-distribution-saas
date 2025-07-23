module.exports = {
  extends: [
    'next/core-web-vitals'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-unsafe-function-type': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    'prefer-const': 'warn',
    '@next/next/no-img-element': 'warn'
  }
};