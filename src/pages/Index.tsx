
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigate('/');
      } else {
        navigate('/login');
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-careviah-light-blue">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-careviah-green mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-careviah-green">Loading CareViah...</h1>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
