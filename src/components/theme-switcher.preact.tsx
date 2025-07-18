import type { ComponentProps, ComponentType } from 'preact';
import { useState } from 'preact/hooks';
import { DropdownMenu } from 'radix-ui';
import IconComputer from '~icons/mdi/computer';
import IconMoon from '~icons/mdi/moon-and-stars';
import IconSun from '~icons/mdi/weather-sunny';
import { cn } from '@/utils/styles';

interface Props {
  className?: string;
  label: string;
  labels: {
    light: string;
    dark: string;
    system: string;
  };
}

const themes = ['light', 'dark', 'system'] as const;
type Theme = (typeof themes)[number];

export function ThemeSwitcherPreact({ label, labels, className }: Props) {
  const [theme, setTheme] = useState<Theme>(() => {
    const storageTheme = localStorage.getItem('theme') as Theme;
    return themes.includes(storageTheme) ? storageTheme : 'system';
  });

  const changeTheme = (theme: Theme) => () => {
    const isDark =
      theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';

    localStorage.setItem('theme', theme);
    setTheme(theme);
  };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            'flex size-12 cursor-pointer items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-lg transition-colors hover:bg-gray-50 focus:focus-outline dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700',
            className,
          )}
          aria-label={label}
        >
          {theme === 'light' ? (
            <IconSun className="size-5 text-amber-500 dark:text-amber-400" />
          ) : theme === 'dark' ? (
            <IconMoon className="size-5 text-indigo-500 dark:text-indigo-400" />
          ) : (
            <IconComputer className="size-5 text-text-tertiary" />
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={12}
          alignOffset={-8}
          className="z-50 min-w-[140px] overflow-hidden rounded-2xl border-0 bg-white/95 shadow-2xl ring-1 ring-gray-200/60 backdrop-blur-md dark:bg-gray-800/95 dark:ring-gray-700/60"
        >
          <div className="p-1">
            <DropdownItem
              label={labels.light}
              icon={IconSun}
              onClick={changeTheme('light')}
              isSelected={theme === 'light'}
              colorClass="text-amber-500 dark:text-amber-400"
            />
            <DropdownItem
              label={labels.dark}
              icon={IconMoon}
              onClick={changeTheme('dark')}
              isSelected={theme === 'dark'}
              colorClass="text-indigo-500 dark:text-indigo-400"
            />
            <DropdownItem
              label={labels.system}
              icon={IconComputer}
              onClick={changeTheme('system')}
              isSelected={theme === 'system'}
              colorClass="text-text-tertiary"
            />
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

interface DropdownItemProps {
  label: string;
  icon: ComponentType<ComponentProps<'svg'>>;
  onClick: () => void;
  isSelected?: boolean;
  colorClass?: string;
}

function DropdownItem({ label, icon: Icon, onClick, isSelected, colorClass }: DropdownItemProps) {
  return (
    <DropdownMenu.Item
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none',
        isSelected
          ? 'cursor-default bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
          : 'cursor-pointer text-text-secondary hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700',
      )}
      onClick={onClick}
    >
      <Icon className={cn('size-4 transition-colors duration-200', colorClass)} />
      <span className="font-medium">{label}</span>
      {isSelected && (
        <div className="ml-auto">
          <div className="size-2 rounded-full bg-blue-500 dark:bg-blue-400" />
        </div>
      )}
    </DropdownMenu.Item>
  );
}
