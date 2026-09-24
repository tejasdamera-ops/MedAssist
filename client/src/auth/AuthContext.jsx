import { createContext, useContext, useMemo, useState } from "react";
import { authApi } from "../api/resources";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("medassist_user");
    return raw ? JSON.parse(raw) : null;
  });

  async function login(credentials) {
    const result = await authApi.login(credentials);
    localStorage.setItem("medassist_access_token", result.data.accessToken);
    localStorage.setItem("medassist_user", JSON.stringify(result.data.user));
    setUser(result.data.user);
    return result.data.user;
  }

  async function register(payload) {
    const result = await authApi.register(payload);
    localStorage.setItem("medassist_access_token", result.data.accessToken);
    localStorage.setItem("medassist_user", JSON.stringify(result.data.user));
    setUser(result.data.user);
    return result.data.user;
  }

  async function logout() {
    await authApi.logout();
    localStorage.removeItem("medassist_access_token");
    localStorage.removeItem("medassist_user");
    setUser(null);
  }

  const value = useMemo(() => ({ user, isAuthenticated: Boolean(user), login, register, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
