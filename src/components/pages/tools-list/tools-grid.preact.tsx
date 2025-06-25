import Fuse from 'fuse.js';
import { useLayoutEffect, useMemo, useRef } from 'preact/hooks';
import MdiCheckCircleOutline from '~icons/mdi/check-circle-outline';
import { useIsClient } from '@/hooks/use-is-client';
import { useSearchParam } from '@/hooks/use-search-param';
import { cn } from '@/utils/styles';

export interface ToolsGridProps {
  className?: string;
  tools: {
    id: string;
    name: string;
    summary: string;
    synonyms: string[];
    url: string;
    hasContent: boolean;
    tags: {
      id: string;
      name: string;
    }[];
  }[];
}

export function ToolsGridPreact({ tools, className }: ToolsGridProps) {
  const isClient = useIsClient();
  const listRef = useRef<HTMLUListElement>(null);
  const [search] = useSearchParam({ name: 'search' });
  const [tag] = useSearchParam({ name: 'tag' });
  const results = useSearch(tools, search, tag);

  useLayoutEffect(() => {
    listRef.current?.closest('[data-tools-section]')?.classList.remove('hidden');
  }, []);

  return (
    <ul
      ref={listRef}
      key={isClient ? 'client' : 'server'}
      className={cn('grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3', className)}
    >
      {results.map((tool) => (
        <li key={tool.id} className="group flex content-auto">
          <a href={tool.url} className="flex w-full flex-col border px-4 py-3">
            <h3 className="font-heading text-xl font-black group-hover:underline">{tool.name}</h3>
            <p className="text-pretty">{tool.summary}</p>
            <ul className="mt-auto flex flex-wrap gap-1.5 pt-6">
              {tool.tags.map((tag) => (
                <li key={tag.id} className="w-fit bg-zinc-200 px-2 py-0.5 text-xs font-medium dark:bg-zinc-700">
                  {tag.name}
                </li>
              ))}
              <StatusIcon hasContent={tool.hasContent} />
            </ul>
          </a>
        </li>
      ))}
    </ul>
  );
}

function StatusIcon({ hasContent }: { hasContent: boolean }) {
  if (!hasContent) return null;

  return (
    <li className="ml-auto">
      <MdiCheckCircleOutline className="size-5" aria-hidden />
    </li>
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
