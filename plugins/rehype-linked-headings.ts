import type { RehypePlugin } from 'astro';
import type { Nodes } from 'hast';
import type { Locale } from '../src/utils/i18n/constants';
import GithubSlugger from 'github-slugger';
import { toString } from 'hast-util-to-string';
import { h, s } from 'hastscript';
import { SKIP, visit } from 'unist-util-visit';
import { defaultLocale, locales } from '../src/utils/i18n/constants';

const anchorLabel: Record<Locale, string> = {
  en: 'Section "{name}"',
  pl: 'Sekcja "{name}"',
};

const rehypeLinkedHeadings: RehypePlugin = () => {
  const include = ['h2', 'h3'];
  const slugger = new GithubSlugger();

  return function (tree, file) {
    const locale = (file.history[0]?.split('/').find((part) => locales.includes(part)) ?? defaultLocale) as Locale;

    visit(tree, 'element', (node, index, parent) => {
      if (typeof index !== 'number' || !parent) return;

      if (
        node.tagName === 'section' &&
        Array.isArray(node.properties.className) &&
        node.properties.className.includes('footnotes')
      ) {
        return SKIP;
      }

      if (!include.includes(node.tagName)) return;

      const text = toString(node);

      if (!text.trim()) return;

      parent.children.splice(index, 1, build(slugger.slug(text), node, locale));

      return [SKIP, index + 1];
    });
  };
};

function build(id: string, node: Nodes, locale: Locale) {
  let text = toString(node);
  if (text.trim() === '') text = '';

  return h('div', { class: 'heading-wrapper' }, [
    node,
    h(
      'a',
      {
        class: 'anchor-link',
        href: `#${id}`,
      },
      [
        s(
          'svg',
          {
            class: 'anchor-icon',
            viewBox: '0 0 16 16',
            version: '1.1',
            width: '1em',
            height: '1em',
            ariaHidden: 'true',
            fill: 'currentColor',
          },
          [
            s('path', {
              d: 'm7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z',
            }),
          ],
        ),
        h('span', { class: 'sr-only' }, anchorLabel[locale].replace('{name}', text)),
      ],
    ),
  ]);
}

export default rehypeLinkedHeadings;
