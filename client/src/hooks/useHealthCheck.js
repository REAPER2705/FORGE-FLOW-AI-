// useHealthCheck Hook
// Check API health status

import { useEffect, useState } from 'react';
import client from '../api/client';

export function useHealthCheck(interval = 5000) {
  const [isHealthy, setIsHealthy] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await client.get('/api/health');
        setIsHealthy(response.data?.success === true);
      } catch (error) {
        setIsHealthy(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkHealth();
    const timeoutId = setInterval(checkHealth, interval);

    return () => clearInterval(timeoutId);
  }, [interval]);

  return { isHealthy, isChecking };
}

export default useHealthCheck;
