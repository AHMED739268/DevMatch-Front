import React, { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const RequireExamPass = ({ children }) => {
  const user = useAuthStore((state) => state.authUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'programmer' && !user.examPassed) {
      navigate('/exam');
    }
  }, [user, navigate]);

  if (user && user.role === 'programmer' && !user.examPassed) {
    return null;
  }
  return children;
};

export default RequireExamPass; 