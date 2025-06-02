import gitignore from 'eslint-config-flat-gitignore';
import astro from 'eslint-plugin-astro';

export default [
  gitignore({
    name: 'eslint/ignore',
    root: true,
    strict: false,
    files: ['.gitignore', '.prettierignore'],
  }),
  ...astro.configs.recommended,
];
