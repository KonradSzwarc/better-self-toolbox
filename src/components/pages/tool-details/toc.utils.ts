import type { MarkdownHeading } from 'astro';

export interface TocItem {
  slug: string;
  text: string;
  children: TocItem[];
}

export function buildToc(headings: MarkdownHeading[]): TocItem[] {
  const toc: TocItem[] = [];

  for (const heading of headings) {
    if (heading.depth === 2) {
      toc.push({ slug: heading.slug, text: heading.text, children: [] });
    }

    if (heading.depth === 3) {
      toc[toc.length - 1]?.children.push({ slug: heading.slug, text: heading.text, children: [] });
    }
  }

  return toc;
}
