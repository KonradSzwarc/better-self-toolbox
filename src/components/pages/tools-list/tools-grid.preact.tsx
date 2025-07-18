import Fuse from 'fuse.js';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import { useIsClient } from '@/hooks/use-is-client';
import { useSearchParam } from '@/hooks/use-search-param';
import { cn } from '@/utils/styles';
import styles from './tools-grid.module.css';

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
      <div className={styles.noResults}>
        <p>{tag ? i18n.noResultsForSearchAndTag : i18n.noResultsForSearch}</p>
        <p>Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <ul ref={listRef} className={cn(styles.list, className)}>
      {results.map((tool) => (
        <ToolsGridItem key={tool.id} tool={tool} />
      ))}
    </ul>
  );
}

function ToolsGridItem({ className, tool }: { className?: string; tool: Tool }) {
  return (
    <li className={cn(styles.item, className)}>
      <a href={tool.url} className={styles.link}>
        <h3 className={styles.name}>{tool.name}</h3>
        <p className={styles.summary}>{tool.summary}</p>
        <ul className={styles.tags}>
          {tool.tags.map((tag) => (
            <li key={tag.id} className={styles.tag}>
              {tag.name}
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
