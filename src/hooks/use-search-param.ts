import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';

interface Props {
  name: string;
  defaultValue?: string;
}

export function useSearchParam({ name, defaultValue = '' }: Props) {
  const getValueFromUrl = useCallback(() => {
    if (typeof window === 'undefined') return defaultValue;
    const url = new URL(window.location.href);
    return url.searchParams.get(name) || defaultValue;
  }, [name, defaultValue]);

  const [value, setValue] = useState<string>(getValueFromUrl);

  useEffect(() => {
    const onQueryChange = () => {
      setValue(getValueFromUrl());
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
