/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import useToast from '../hooks/useToast';
import { subscribeAuthLogout } from '../utils/authEvents';

export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  logout: () => {},
  updateUser: () => {},
  isSecretLogin: () => false,
});

const STORAGE_USER_KEY = 'authUser';
const STORAGE_TOKEN_KEY = 'accessToken';
const STORAGE_SECRET_LOGIN_KEY = 'isSecretLogin';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

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

  const isSecretLogin = useCallback(() => {
    return localStorage.getItem(STORAGE_SECRET_LOGIN_KEY) === 'true';
  }, []);

  const updateUser = useCallback((updater) => {
    setUser((prevUser) => {
      const nextUser = typeof updater === 'function' ? updater(prevUser) : updater;
      if (nextUser) {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser));
      } else {
        localStorage.removeItem(STORAGE_USER_KEY);
      }
      return nextUser;
    });
  }, []);

  const login = useCallback(
    async ({ email, password }, fromSecretRoute = false) => {
      setIsLoading(true);
      try {
        const { data } = await apiClient.post(
          '/auth/login',
          { email, password },
          { __isAuthRequest: true },
        );
        const nextToken = data?.token || data?.accessToken;
        const nextUser = data?.user || null;

        if (!nextToken || !nextUser) {
          throw new Error('Invalid login response');
        }

        localStorage.setItem(STORAGE_TOKEN_KEY, nextToken);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser));
        // Store secret login flag only for SUPER_ADMIN
        if (nextUser.role === 'SUPER_ADMIN') {
          localStorage.setItem(STORAGE_SECRET_LOGIN_KEY, fromSecretRoute ? 'true' : 'false');
        } else {
          localStorage.removeItem(STORAGE_SECRET_LOGIN_KEY);
        }

        setToken(nextToken);
        setUser(nextUser);
        showToast({
          title: `Welcome back${nextUser.name ? `, ${nextUser.name}` : ''}!`,
          variant: 'success',
        });

        return { user: nextUser, token: nextToken };
      } finally {
        setIsLoading(false);
      }
    },
    [showToast],
  );

  const logout = useCallback(
    (arg) => {
      const message = typeof arg === 'string' ? arg : undefined;
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_SECRET_LOGIN_KEY);
      setToken(null);
      setUser(null);
      showToast({
        title: message || 'Signed out',
        variant: message ? 'warning' : 'info',
      });
      navigate('/auth/login', { replace: true });
    },
    [navigate, showToast],
  );

  useEffect(() => {
    const unsubscribe = subscribeAuthLogout(({ message }) => logout(message));
    return unsubscribe;
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading: isLoading || !isInitialized,
      login,
      logout,
      updateUser,
      isSecretLogin,
    }),
    [user, token, isLoading, isInitialized, login, logout, updateUser, isSecretLogin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


