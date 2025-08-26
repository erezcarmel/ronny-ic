'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook to protect client-side routes from unauthorized access
 * @returns {boolean} isAuthenticated - Whether the user is authenticated
 */
export function useAuthProtection() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        // Redirect to login if no token
        router.push('/admin/login');
        return false;
      }
      
      // Here you could also verify the token validity if needed
      return true;
    };

    const isAuth = checkAuth();
    setIsAuthenticated(isAuth);
    setIsLoading(false);
  }, [router]);

  return { isAuthenticated, isLoading };
}

export default useAuthProtection;
