import antfu from '@antfu/eslint-config';

export default antfu({
  stylistic: false,
  jsonc: false,

  astro: true,
  react: true,
  imports: true,
});
