import tt from '@tailwindcss/typography/src/styles.js';
import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.prose-h2-sizing': {
          marginTop: tt.DEFAULT.css[2].h2.marginTop,
          marginBottom: tt.DEFAULT.css[2].h2.marginBottom,
          fontSize: tt.DEFAULT.css[2].h2.fontSize,
          lineHeight: tt.DEFAULT.css[2].h2.lineHeight,
        },
        '.prose-h3-sizing': {
          marginTop: tt.DEFAULT.css[2].h3.marginTop,
          marginBottom: tt.DEFAULT.css[2].h3.marginBottom,
          fontSize: tt.DEFAULT.css[2].h3.fontSize,
          lineHeight: tt.DEFAULT.css[2].h3.lineHeight,
        },
      });
    }),
  ],
};
