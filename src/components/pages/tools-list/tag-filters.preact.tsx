import { RadioGroup } from 'radix-ui';
import { useSearchParam } from '@/hooks/use-search-param';
import { cn } from '@/utils/styles';
import styles from './tag-filters.module.css';

export interface TagFiltersProps {
  className?: string;
  label: string;
  allTagLabel: string;
  tags: {
    id: string;
    name: string;
  }[];
}

export function TagFiltersPreact({ className, label, allTagLabel, tags }: TagFiltersProps) {
  const [selectedTag, changeSelectedTag] = useSearchParam({ name: 'tag', defaultValue: 'all' });

  return (
    <div className={cn(styles.container, className)}>
      <div className={styles.label}>{label}</div>
      <RadioGroup.Root
        className={styles.group}
        aria-label={label}
        value={selectedTag}
        onValueChange={changeSelectedTag}
      >
        <TagFilter id="all" name={allTagLabel} />
        {tags.map((tag) => (
          <TagFilter key={tag.id} {...tag} />
        ))}
      </RadioGroup.Root>
    </div>
  );
}

function TagFilter({ id, name }: { id: string; name: string }) {
  return (
    <RadioGroup.Item value={id} className={styles.item}>
      {name}
    </RadioGroup.Item>
  );
}
