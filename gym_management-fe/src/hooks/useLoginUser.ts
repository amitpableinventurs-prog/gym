import { useState } from 'react';
import { loginUser } from '../services/userService';
import { AxiosResponse } from 'axios';

const useLoginUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<AxiosResponse> => {
    setLoading(true);
    try {
      const response = await loginUser(email, password);
      return response;
    } catch (err) {
      setError('Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

export default useLoginUser;
