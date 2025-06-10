import { useSearchParam } from '@/hooks/use-search-param';
import { cn } from '@/utils/styles';

interface Props {
  className?: string;
  placeholder: string;
  initialValue?: string | null;
}

export function SearchInputReact({ className, placeholder, initialValue }: Props) {
  const [search, changeSearch] = useSearchParam({ name: 'search', initialValue });

  return (
    <input
      type="search"
      value={search}
      onChange={(e) => changeSearch(e.target.value)}
      placeholder={placeholder}
      className={cn('border p-2 placeholder:text-foreground/75', className)}
    />
  );
}
