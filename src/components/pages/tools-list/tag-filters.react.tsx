import { RadioGroup } from 'radix-ui';
import { Tooltip } from 'radix-ui';
import { useSearchParam } from '@/hooks/use-search-param';
import { cn } from '@/utils/styles';
import { useEffect, useRef, useState } from 'react';

interface Props {
  className?: string;
  label: string;
  allTagLabel: string;
  initialValue?: string | null;
  tags: {
    id: string;
    name: string;
    summary?: string;
  }[];
}

export function TagFiltersReact({ className, label, allTagLabel, tags, initialValue }: Props) {
  const [selectedTag, changeSelectedTag] = useSearchParam({ name: 'tag', defaultValue: 'all', initialValue });

  return (
    <Tooltip.Provider delayDuration={1000} disableHoverableContent>
      <RadioGroup.Root
        className={cn('flex flex-wrap justify-center gap-2', className)}
        aria-label={label}
        value={selectedTag}
        onValueChange={changeSelectedTag}
      >
        <TagFilter id="all" name={allTagLabel} />
        {tags.map((tag) => (
          <TagFilter key={tag.id} {...tag} />
        ))}
      </RadioGroup.Root>
    </Tooltip.Provider>
  );
}

interface TagFilterProps {
  id: string;
  name: string;
  summary?: string;
}

function TagFilter({ id, name, summary }: TagFilterProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let timeout: NodeJS.Timeout;

    const onTouchStart = () => {
      timeout = setTimeout(() => setOpen(true), 500);
    };

    const onTouchEnd = () => {
      clearTimeout(timeout);
    };

    element.addEventListener('touchstart', onTouchStart);
    element.addEventListener('touchend', onTouchEnd);

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const item = (
    <RadioGroup.Item
      value={id}
      ref={ref}
      className="flex cursor-pointer items-center border px-2 py-1 select-none data-[state=checked]:bg-black data-[state=checked]:text-white"
    >
      {name}
    </RadioGroup.Item>
  );

  return summary ? (
    <Tooltip.Root open={open} onOpenChange={setOpen}>
      <Tooltip.Trigger asChild>
        <div>{item}</div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sideOffset={8}
          className="mx-2 max-w-[calc(100vw-2rem)] border bg-white px-4 py-3 text-pretty shadow md:max-w-lg"
        >
          {summary}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  ) : (
    item
  );
}
