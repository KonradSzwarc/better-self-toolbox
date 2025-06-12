import { useSearchParam } from '@/hooks/use-search-param';
import { cn } from '@/utils/styles';

export interface SearchInputProps {
  className?: string;
  placeholder: string;
}

export function SearchInputPreact({ className, placeholder }: SearchInputProps) {
  const [search, changeSearch] = useSearchParam({ name: 'search' });

  return (
    <input
      type="search"
      value={search}
      onInput={(e) => changeSearch(e.currentTarget.value)}
      placeholder={placeholder}
      className={cn('border p-2 placeholder:text-foreground/75', className)}
    />
  );
}
