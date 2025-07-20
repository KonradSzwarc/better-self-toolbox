import { useState } from 'preact/hooks';
import { DropdownMenu } from 'radix-ui';
import IconComputer from '~icons/mdi/computer';
import IconMoon from '~icons/mdi/moon-and-stars';
import IconSun from '~icons/mdi/weather-sunny';
import { cn } from '@/utils/styles';
import styles from './theme-switcher.module.css';

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

  const changeTheme = (theme: Theme) => {
    const isDark =
      theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';

    localStorage.setItem('theme', theme);
    setTheme(theme);
  };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button type="button" className={cn(styles.trigger, className)} aria-label={label}>
          {theme === 'light' ? (
            <IconSun className={styles.iconSun} />
          ) : theme === 'dark' ? (
            <IconMoon className={styles.iconMoon} />
          ) : (
            <IconComputer className={styles.iconComputer} />
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={12} alignOffset={-8} className={styles.content}>
          <div className="p-1">
            <DropdownItem theme={theme} label={labels.light} value="light" onClick={changeTheme} />
            <DropdownItem theme={theme} label={labels.dark} value="dark" onClick={changeTheme} />
            <DropdownItem theme={theme} label={labels.system} value="system" onClick={changeTheme} />
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

interface DropdownItemProps {
  label: string;
  value: Theme;
  theme: Theme;
  onClick: (theme: Theme) => void;
}

const items = {
  light: { icon: IconSun, class: styles.iconSun },
  dark: { icon: IconMoon, class: styles.iconMoon },
  system: { icon: IconComputer, class: styles.iconComputer },
};

function DropdownItem({ label, value, theme, onClick }: DropdownItemProps) {
  const isSelected = value === theme;
  const { icon: Icon, class: colorClass } = items[value];

  return (
    <DropdownMenu.Item
      data-selected={isSelected}
      className={cn(styles.item)}
      disabled={isSelected}
      onClick={() => onClick(value)}
    >
      <Icon className={cn('size-4 transition-colors duration-200', colorClass)} />
      <span className="font-medium">{label}</span>
      {isSelected && <div className={cn('ml-auto', styles.dot)} />}
    </DropdownMenu.Item>
  );
}
