import { useState } from 'react';
import { updateUser } from '../services/userService';
import { RegisterData } from '../services/userService';
import Cookies from 'js-cookie';
import { RootState } from '../redux/store';
import { useSelector } from 'react-redux';

const useUpdateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = Cookies.get("authToken");
  const userId = useSelector((state: RootState) => state.user.id);

  const update = async (data: Partial<RegisterData>) => {
    if (!token) throw new Error("No token found");
    setLoading(true);
    try {
      const response = await updateUser(data, token, userId);
      return response;
    } catch (err) {
      setError('Update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
};

export default useUpdateUser; 