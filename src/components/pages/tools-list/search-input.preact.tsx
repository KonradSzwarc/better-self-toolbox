import IconSearch from '~icons/mdi/magnify';
import { useSearchParam } from '@/hooks/use-search-param';
import { cn } from '@/utils/styles';
import styles from './search-input.module.css';

export interface SearchInputProps {
  className?: string;
  placeholder: string;
}

export function SearchInputPreact({ className, placeholder }: SearchInputProps) {
  const [search, changeSearch] = useSearchParam({ name: 'search' });

  return (
    <div className={cn(styles.container, className)}>
      <div className={styles.icon}>
        <IconSearch />
      </div>
      <input
        type="search"
        value={search}
        onInput={(e) => changeSearch(e.currentTarget.value)}
        placeholder={placeholder}
        className={styles.input}
      />
    </div>
  );
}
