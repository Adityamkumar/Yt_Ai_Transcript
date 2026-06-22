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

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: "local" | "google";
  hasPassword?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
  loginWithGoogle: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
        hasPassword: userData.hasPassword,
      });
      localStorage.setItem("isAuthenticated", "true");
    } catch {
      setUser(null);
      localStorage.removeItem("isAuthenticated");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") === "true") {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const response = await axiosInstance.post("/api/v1/user/login", {
      email,
      password,
    });
    const userData = response.data.user.user;
    setUser({
      id: userData._id || userData.id,
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar || undefined,
      provider: userData.provider || "local",
      hasPassword: userData.hasPassword,
    });
    localStorage.setItem("isAuthenticated", "true");
    navigate("/app");
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await axiosInstance.post("/api/v1/user/register", {
      name,
      email,
      password,
    });
    const userData = response.data.user;
    setUser({
      id: userData.id || userData._id,
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar || undefined,
      hasPassword: userData.hasPassword,
    });
    localStorage.setItem("isAuthenticated", "true");
    navigate("/app");
  };

  const loginWithGoogle = useCallback(async (code: string) => {
    const userData = await authService.verifyGoogleCode(code);
    setUser({
      id: userData.id || userData._id,
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar || undefined,
      provider: userData.provider || "google",
      hasPassword: userData.hasPassword,
    });
    localStorage.setItem("isAuthenticated", "true");
    navigate("/app");
  }, [navigate]);

  const logout = async () => {
    try {
      await axiosInstance.post("/api/v1/user/logout");
    } finally {
      setUser(null);
      localStorage.removeItem("isAuthenticated");
      navigate("/");
    }
  };

  const deleteAccount = async (password?: string) => {
    if (!user) throw new Error("Not authenticated");
    await axiosInstance.delete(`/api/v1/user/delete/${user.id}`, {
      data: { password },
    });
    setUser(null);
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
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

