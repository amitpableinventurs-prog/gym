import { useState } from 'react';
import { updatePassword } from '../services/userService';
import { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

const usePasswordUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = Cookies.get("authToken");


const updatePasswordUser = async (data: object, userId: string): Promise<AxiosResponse> => {
    if (!token) {
      throw new Error('No auth token found');
    }
    setLoading(true);
    try {
      const response = await updatePassword(data, token, userId);
      return response;
    } catch (err) {
      setError('Update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updatePasswordUser, loading, error };
};

export default usePasswordUser; 