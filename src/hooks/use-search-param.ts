import { useCallback, useEffect, useMemo, useState } from 'react';

interface Props {
  name: string;
  defaultValue?: string;
  initialValue?: string | null;
}

export function useSearchParam({ name, defaultValue = '', initialValue }: Props) {
  const [value, setValue] = useState<string>(initialValue ?? defaultValue);

  useEffect(() => {
    const onQueryChange = () => {
      const url = new URL(window.location.href);
      setValue(url.searchParams.get(name) || defaultValue);
    };

    window.addEventListener('query-change', onQueryChange);

    return () => {
      window.removeEventListener('query-change', onQueryChange);
    };
  }, []);

  const changeValue = useCallback(
    (newValue: string) => {
      const url = new URL(window.location.href);

      if (newValue === defaultValue) {
        url.searchParams.delete(name);
      } else {
        url.searchParams.set(name, newValue);
      }

      history.replaceState(null, '', url.toString());
      window.dispatchEvent(new Event('query-change'));
    },
    [name, defaultValue],
  );

  return useMemo(() => [value, changeValue] as const, [value, changeValue]);
}
