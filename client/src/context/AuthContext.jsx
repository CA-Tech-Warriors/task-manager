import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api';
import { ApiError, tokenStore } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!tokenStore.get());

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // A saved token from an earlier visit: load the user it belongs to.
  useEffect(() => {
    if (!tokenStore.get()) return;
    authApi
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setReady(true));
  }, []);

  // Any request that comes back 401 ends the session.
  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [logout]);

  const startSession = useCallback(async (token, maybeUser, remember) => {
    if (!token) throw new ApiError('The server did not send back a login token.', 500);
    tokenStore.set(token, remember);
    const signedIn = maybeUser?.id !== undefined ? maybeUser : await authApi.me();
    setUser(signedIn);
    return signedIn;
  }, []);

  const login = useCallback(
    async (identifier, password, remember) => {
      const result = await authApi.login(identifier, password, remember);
      return startSession(result.token, result.user, remember);
    },
    [startSession],
  );

  const register = useCallback(
    async (fields) => {
      const result = await authApi.register(fields);
      if (result.token) return startSession(result.token, result.user, true);
      // Some APIs create the account without logging in. Log in right after.
      const loggedIn = await authApi.login(fields.username, fields.password, true);
      return startSession(loggedIn.token, loggedIn.user, true);
    },
    [startSession],
  );

  const value = useMemo(
    () => ({ user, ready, isAdmin: user?.role === 'admin', login, register, logout, setUser }),
    [user, ready, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
