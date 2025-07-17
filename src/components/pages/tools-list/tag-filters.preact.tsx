import { RadioGroup } from 'radix-ui';
import { useSearchParam } from '@/hooks/use-search-param';
import { cn } from '@/utils/styles';

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
    <div className={cn('flex w-full max-w-6xl flex-col items-center gap-3', className)}>
      <div className="text-sm font-medium text-text-tertiary">{label}</div>
      <RadioGroup.Root
        className="flex w-full flex-wrap justify-center gap-2"
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

interface TagFilterProps {
  id: string;
  name: string;
}

function TagFilter({ id, name }: TagFilterProps) {
  return (
    <RadioGroup.Item
      value={id}
      className={cn(
        'cursor-pointer rounded-full border-0 bg-gray-100 px-4 py-2.5 text-sm font-medium text-text-secondary transition-optimized duration-200 select-none focus:focus-outline',
        'data-[state=unchecked]:hover:scale-105 data-[state=unchecked]:hover:bg-gray-200',
        'data-[state=checked]:bg-gradient-to-r data-[state=checked]:gradient-primary data-[state=checked]:text-white data-[state=checked]:shadow-lg data-[state=checked]:shadow-blue-500/25',
        'dark:bg-gray-800 dark:data-[state=unchecked]:hover:bg-gray-700',
        'dark:data-[state=checked]:shadow-blue-400/20',
      )}
    >
      {name}
    </RadioGroup.Item>
  );
}
