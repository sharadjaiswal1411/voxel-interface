module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      // Allows for the parsing of JSX
      jsx: true,
    },
  },
  ignorePatterns: [
    'src/locales/**/*.js',
    'src/locales/**/en-US.po',
    'node_modules',
    'src/**/charting_library.*',
    'src/**/charting_library/**',
    'build',
    'dist',
    '.DS_Store',
    '.env.local',
    '.env.development.local',
    '.env.test.local',
    '.env.production.local',
    '.idea/',
    '.vscode/',
    'public',
    'package-lock.json',
    'yarn.lock',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    'react-app',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['better-styled-components', 'unused-imports'],
  rules: {
    'unused-imports/no-unused-imports': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'prettier/prettier': [
      0,
      {
        endOfLine: 'auto',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/camelcase': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    'no-duplicate-imports': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-pascal-case': 'off',
    '@typescript-eslint/no-var-requires': 'off',
  },
}
