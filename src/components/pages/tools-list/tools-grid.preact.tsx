import Fuse from 'fuse.js';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import { useIsClient } from '@/hooks/use-is-client';
import { useSearchParam } from '@/hooks/use-search-param';
import { cn } from '@/utils/styles';

export interface ToolsGridProps {
  className?: string;
  tools: Tool[];
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
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-lg font-medium text-gray-900 dark:text-white">
          {tag ? i18n.noResultsForSearchAndTag : i18n.noResultsForSearch}
        </div>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your search or filter criteria
        </div>
      </div>
    );
  }

  return (
    <ul ref={listRef} className={cn('grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3', className)}>
      {results.map((tool) => (
        <ToolsGridItem key={tool.id} tool={tool} />
      ))}
    </ul>
  );
}

function ToolsGridItem({ className, tool }: { className?: string; tool: Tool }) {
  return (
    <li
      className={cn(
        'group relative flex rounded-2xl border border-gray-200/60 bg-white shadow-md transition-optimized duration-300 content-auto hover:-translate-y-2 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/15 has-focus:focus-outline dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-blue-600/50 dark:hover:shadow-blue-400/15',
        className,
      )}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-950/20 dark:to-indigo-950/20" />
      <a href={tool.url} className="relative z-10 flex w-full flex-col px-6 py-5">
        <h3 className="mb-2 font-heading text-xl leading-tight font-extrabold text-gray-900 transition-colors duration-200 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {tool.name}
        </h3>
        <p className="flex-grow text-sm leading-relaxed text-pretty text-gray-600 dark:text-gray-300">{tool.summary}</p>
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-6">
          {tool.tags.map((tag) => (
            <li key={tag.id}>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600">
                {tag.name}
              </span>
            </li>
          ))}
        </ul>
      </a>
    </li>
  );
}

function useSearch(tools: Tool[], search: string, tagId: string) {
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

interface Tool {
  id: string;
  name: string;
  summary: string;
  synonyms: string[];
  url: string;
  tags: {
    id: string;
    name: string;
  }[];
}
