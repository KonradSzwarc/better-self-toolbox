import type { Locale } from '@/utils/i18n';
import { Fragment } from 'preact';
import { DropdownMenu } from 'radix-ui';
import { cn } from '@/utils/styles';

interface Props {
  label: string;
  value: string;
  className?: string;
  languages: Record<
    Locale,
    {
      flag: string;
      label: string;
      path: string;
    }
  >;
}

export function LanguageSwitcherPreact({ label, value, languages, className }: Props) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn('flex size-8 cursor-pointer items-center justify-center border', className)}
          aria-label={label}
        >
          {value}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={8} alignOffset={-16} className="grid border shadow-sm">
          {Object.values(languages).map(({ flag, label, path }, i, arr) => (
            <Fragment key={label}>
              <DropdownMenu.Item asChild className="block min-w-20 p-2 whitespace-nowrap">
                <a href={path}>
                  {flag} {label}
                </a>
              </DropdownMenu.Item>
              {i < arr.length - 1 && <DropdownMenu.Separator className="h-px" />}
            </Fragment>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
