/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../api/apiClient';

export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  logout: () => {},
});

const STORAGE_USER_KEY = 'authUser';
const STORAGE_TOKEN_KEY = 'accessToken';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
    const storedUser = localStorage.getItem(STORAGE_USER_KEY);
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(STORAGE_USER_KEY);
      }
    }
    setIsInitialized(true);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      const nextToken = data?.token || data?.accessToken;
      const nextUser = data?.user || null;

      if (!nextToken || !nextUser) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem(STORAGE_TOKEN_KEY, nextToken);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser));

      setToken(nextToken);
      setUser(nextUser);

      return { user: nextUser, token: nextToken };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading: isLoading || !isInitialized,
      login,
      logout,
    }),
    [user, token, isLoading, isInitialized, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


