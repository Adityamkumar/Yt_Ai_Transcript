import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { authService } from "@/services/auth.service";
import type { ResponseLanguage } from "@/services/settings.service";
import { useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: "local" | "google";
  isEmailVerified: boolean;
  hasPassword?: boolean;
  preferences?: {
    responseLanguage?: ResponseLanguage;
  };
}

export type AuthStatus = "checking" | "authenticated" | "unauthenticated" | "error";

interface AuthContextType {
  user: User | null;
  authStatus: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  refreshUser: () => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
  loginWithGoogle: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const navigate = useNavigate();
  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser({
        id: userData.id || userData._id,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar || undefined,
        provider: userData.provider || "local",
        isEmailVerified: Boolean(userData.isEmailVerified),
        hasPassword: userData.hasPassword,
        preferences: userData.preferences,
      });
      setAuthStatus('authenticated')
    } catch (err: any) {
      setUser(null);
      if (err?.response?.status === 401) {
        setAuthStatus("unauthenticated");
      } else {
        setAuthStatus("error");
      }
    }
  }, []);

  useEffect(() => {
  refreshUser();
}, [refreshUser]);

  const login = async (email: string, password: string) => {
    const response = await axiosInstance.post("/api/v1/user/login", {
      email,
      password,
    });
    const userData = response.data.data.user
    console.log(userData)
    setUser({
      id: userData._id || userData.id,
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar || undefined,
      provider: userData.provider || "local",
      isEmailVerified: Boolean(userData.isEmailVerified),
      hasPassword: userData.hasPassword,
      preferences: userData.preferences,
    });
    setAuthStatus("authenticated");
    navigate("/app");
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await axiosInstance.post("/api/v1/user/register", {
      name,
      email,
      password,
    });
    const userData = response.data.user;

    navigate("/verify-email", { state: { email: userData.email } });
  };

  const loginWithGoogle = useCallback(async (code: string) => {
    await authService.verifyGoogleCode(code);
    await refreshUser()
    setAuthStatus("authenticated");
    navigate("/app");
  }, [navigate, refreshUser]);

  const queryClient = useQueryClient();
  const logout = async () => {
    try {
      await axiosInstance.post("/api/v1/user/logout");
    } finally {
      if (user?.id) {
      queryClient.removeQueries({
        queryKey: ["sessions", user.id],
      });
    }
      setUser(null);
      setAuthStatus("unauthenticated");
      navigate("/");
    }
  };

  const logoutAllDevices = async () => {
    try {
      await authService.logoutAllDevices();
    } finally {
      setUser(null);
      setAuthStatus("unauthenticated");
      navigate("/");
    }
  };

  const deleteAccount = async (password?: string) => {
    if (!user) throw new Error("Not authenticated");
    await axiosInstance.delete(`/api/v1/user/delete/${user.id}`, {
      data: { password },
    });
    setUser(null);
    setAuthStatus("unauthenticated");
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authStatus,
        login,
        register,
        logout,
        logoutAllDevices,
        refreshUser,
        deleteAccount,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

