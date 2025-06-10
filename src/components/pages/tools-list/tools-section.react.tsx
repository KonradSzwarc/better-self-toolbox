import Fuse from 'fuse.js';
import { useSearchParam } from '@/hooks/use-search-param';
import { localizedPath, omitLocale } from '@/utils/i18n';
import type { Locale } from '@/utils/i18n/constants';
import { cn } from '@/utils/styles';
import { useMemo } from 'react';

interface Props {
  className?: string;
  locale: Locale;
  initialSearch?: string | null;
  initialTag?: string | null;
  tags: {
    id: string;
    name: string;
  }[];
  tools: {
    id: string;
    name: string;
    summary: string;
    synonyms: string[];
    tagIds: string[];
  }[];
}

export function ToolsSectionReact({ tools, tags, className, locale, initialSearch, initialTag }: Props) {
  const [search] = useSearchParam({ name: 'search', initialValue: initialSearch });
  const [tag] = useSearchParam({ name: 'tag', initialValue: initialTag });
  const results = useSearch(tools, search, tag);

  return (
    <section className={cn('flex flex-col items-center', className)}>
      <ul data-tools-list className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {results
          .toSorted((a, b) => a.name.localeCompare(b.name))
          .map((tool) => (
            <li key={tool.id} className={cn('flex flex-col border px-4 py-3')}>
              <h3 className="font-heading text-xl font-black">
                <a href={localizedPath(`/${omitLocale(tool.id)}`, locale)} className="hover:underline">
                  {tool.name}
                </a>
              </h3>
              <p className="text-pretty">{tool.summary}</p>
              <ul className="mt-auto flex flex-wrap gap-1.5 pt-6">
                {tool.tagIds.map((tagId) => (
                  <li key={tagId} className="w-fit bg-zinc-200 px-2 py-0.5 text-xs font-medium">
                    {tags.find((t) => t.id === tagId)?.name}
                  </li>
                ))}
              </ul>
            </li>
          ))}
      </ul>
    </section>
  );
}

function useSearch(tools: Props['tools'], search: string, tagId: string) {
  const fuse = useMemo(
    () =>
      new Fuse(tools, {
        keys: ['name', 'synonyms', 'tags'],
        threshold: 0.3,
        minMatchCharLength: 1,
      }),
    [tools],
  );

  return useMemo(() => {
    let results = search ? fuse.search(search).map((result) => result.item) : tools;

    if (tagId) {
      results = results.filter((result) => result.tagIds.includes(tagId));
    }

    return results;
  }, [search, tagId, fuse]);
}
