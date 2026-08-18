// usePolling Hook
// Reusable polling hook for API data fetching

import { useEffect, useState } from 'react';

export function usePolling(fetchFn, interval = 5000, immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  useEffect(() => {
    let timeoutId;

    const poll = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn();
        setData(result);
      } catch (err) {
        setError(err?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
        timeoutId = setTimeout(poll, interval);
      }
    };

    if (immediate) {
      poll();
    } else {
      timeoutId = setTimeout(poll, interval);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fetchFn, interval, immediate]);

  return { data, loading, error };
}

export default usePolling;
