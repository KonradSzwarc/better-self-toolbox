import type { ToolsGridItemProps } from './tools-grid-item.preact';
import Fuse from 'fuse.js';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import { useIsClient } from '@/hooks/use-is-client';
import { useSearchParam } from '@/hooks/use-search-param';
import { cn } from '@/utils/styles';
import { ToolsGridItemPreact } from './tools-grid-item.preact';

export interface ToolsGridProps {
  className?: string;
  tools: ToolsGridItemProps['tool'][];
  i18n: {
    noResultsForSearch: string;
    noResultsForSearchAndTag: string;
  };
}

export function ToolsGridPreact({ tools, className, i18n }: ToolsGridProps) {
  const isClient = useIsClient();
  const listRef = useRef<HTMLUListElement>(null);
  const [search] = useSearchParam({ name: 'search' });
  const [tag] = useSearchParam({ name: 'tag' });
  const searchResults = useSearch(tools, search, tag);

  useEffect(() => {
    listRef.current?.closest('[data-tools-section]')?.classList.remove('hidden');
  }, []);

  const results = isClient ? searchResults : tools.toSorted((a, b) => a.name.localeCompare(b.name));

  if (results.length === 0) {
    return <div className="text-center">{tag ? i18n.noResultsForSearchAndTag : i18n.noResultsForSearch}</div>;
  }

  return (
    <ul ref={listRef} className={cn('grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3', className)}>
      {results.map((tool) => (
        <ToolsGridItemPreact key={tool.id} tool={tool} />
      ))}
    </ul>
  );
}

function useSearch(tools: ToolsGridProps['tools'], search: string, tagId: string) {
  const fuse = useMemo(
    () =>
      new Fuse(tools, {
        keys: [
          {
            name: 'name',
            weight: 1,
          },
          {
            name: 'synonyms',
            weight: 0.25,
          },
          {
            name: 'tags.name',
            weight: 0.05,
          },
          {
            name: 'summary',
            weight: 0.05,
          },
        ],
        threshold: 0.2,
        minMatchCharLength: 1,
        ignoreLocation: true,
        shouldSort: true,
      }),
    [tools],
  );
  const trimmedSearch = search?.trim();

  return useMemo(() => {
    let results = trimmedSearch
      ? fuse.search(trimmedSearch).map((result) => result.item)
      : tools.toSorted((a, b) => a.name.localeCompare(b.name));

    if (tagId) {
      results = results.filter((result) => result.tags.some((tag) => tag.id === tagId));
    }

    return results;
  }, [trimmedSearch, tagId, fuse, tools]);
}
