import { useState, useEffect } from 'react';
import { getCoach } from '../services/userService';
import { Coach } from '../types/coach';

interface CoachResponse {
  coach: Coach[];
}

function useFetchCoaches(token: string) {
  const [data, setData] = useState<CoachResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCoaches = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCoach(token);
        setData(data.data);
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || 'Failed to fetch coaches');
      } finally {
        setLoading(false);
      }
    };

    getCoaches();
  }, [token]);

  return { data, loading, error };
}

export default useFetchCoaches;
