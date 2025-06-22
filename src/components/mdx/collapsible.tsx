import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { Collapsible as _Collapsible } from 'radix-ui';
import MdiChevronDown from '~icons/mdi/chevron-down';
import MdiChevronUp from '~icons/mdi/chevron-up';

const { Root, Trigger, Content } = _Collapsible;

export interface CollapsibleProps {
  title: ComponentChildren;
  children: ComponentChildren;
}

export function Collapsible({ title, children }: CollapsibleProps) {
  const [open, setOpen] = useState(false);

  return (
    <Root open={open} onOpenChange={setOpen}>
      <Trigger className="flex cursor-pointer items-center gap-1">
        {open ? <MdiChevronUp /> : <MdiChevronDown />}
        {title}
      </Trigger>
      <Content>{children}</Content>
    </Root>
  );
}
