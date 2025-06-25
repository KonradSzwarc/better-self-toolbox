import { useEffect, useState } from 'preact/hooks';

export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect -- fine for this use case
    setIsClient(true);
  }, []);

  return isClient;
}
