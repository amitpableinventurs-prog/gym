import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser as register, RegisterData } from '../services/userService';

const useRegisterUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const registerUser = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await register(data);
      if (response) {
        navigate('/login');
      }
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    registerUser,
    loading,
    error
  };
};

export default useRegisterUser;
