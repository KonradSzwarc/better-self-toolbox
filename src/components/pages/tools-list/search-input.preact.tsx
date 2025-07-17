import IconSearch from '~icons/mdi/magnify';
import { useSearchParam } from '@/hooks/use-search-param';
import { cn } from '@/utils/styles';

export interface SearchInputProps {
  className?: string;
  placeholder: string;
}

export function SearchInputPreact({ className, placeholder }: SearchInputProps) {
  const [search, changeSearch] = useSearchParam({ name: 'search' });

  return (
    <div className={cn('relative w-full', className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <IconSearch className="size-5 text-gray-400 dark:text-gray-500" />
      </div>
      <input
        type="search"
        value={search}
        onInput={(e) => changeSearch(e.currentTarget.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border-1 border-gray-200 bg-gray-100 py-4 pr-4 pl-12 text-gray-900 transition-optimized duration-200 placeholder:text-gray-500 focus:focus-outline dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
      />
    </div>
  );
}
