import { useState, type ComponentType, type SVGProps } from 'react';
import { DropdownMenu } from 'radix-ui';
import { cn } from '@/utils/styles';
import IconMoon from '~icons/mdi/moon-and-stars';
import IconSun from '~icons/mdi/weather-sunny';
import IconComputer from '~icons/mdi/computer';

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

export function ThemeSwitcherReact({ label, labels, className }: Props) {
  const [theme, setTheme] = useState<Theme>(() => {
    const storageTheme = localStorage.getItem('theme');
    return themes.includes(storageTheme as Theme) ? (storageTheme as Theme) : 'system';
  });

  const changeTheme = (theme: Theme) => () => {
    const isDark =
      theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList[isDark ? 'add' : 'remove']('dark');

    localStorage.setItem('theme', theme);
    setTheme(theme);
  };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn('flex size-8 cursor-pointer items-center justify-center border', className)}
          aria-label={label}
        >
          {theme === 'light' ? <IconSun /> : theme === 'dark' ? <IconMoon /> : <IconComputer />}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          alignOffset={-16}
          className="grid border bg-background shadow-sm"
        >
          <DropdownItem label={labels.light} icon={IconSun} onClick={changeTheme('light')} />
          <DropdownMenu.Separator className="h-px bg-border" />
          <DropdownItem label={labels.dark} icon={IconMoon} onClick={changeTheme('dark')} />
          <DropdownMenu.Separator className="h-px bg-border" />
          <DropdownItem label={labels.system} icon={IconComputer} onClick={changeTheme('system')} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

interface DropdownItemProps {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  onClick: () => void;
}

function DropdownItem({ label, icon: Icon, onClick }: DropdownItemProps) {
  return (
    <DropdownMenu.Item
      className="flex min-w-20 cursor-pointer items-center gap-1 p-2 whitespace-nowrap text-foreground"
      onClick={onClick}
    >
      <Icon />
      <span>{label}</span>
    </DropdownMenu.Item>
  );
}
